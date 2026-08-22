import { Router } from 'express';
import crypto from 'crypto';
import passport, { googleCallbackURL } from '../utils/passport.js';
import { createOAuthState, verifyOAuthState, nonceMatches, STATE_TTL_SECONDS } from '../utils/oauthState.js';
import { isAllowedOrigin, frontendBaseUrl } from '../utils/allowedOrigins.js';

const authRouter = Router();

// ---------------------------------------------------------------------------
// Login-CSRF protection without sessions: when the flow starts we set a random
// nonce in an HttpOnly cookie scoped to this backend and put its hash inside
// the signed OAuth `state`. Google sends the browser back with that state; we
// only exchange the authorization code if the cookie matches. A code captured
// by an attacker can therefore not be "planted" into a victim's browser.
// SameSite=Lax cookies ARE sent on Google's top-level GET redirect back to us.
// ---------------------------------------------------------------------------
const NONCE_COOKIE = 'swk_oauth_nonce';
const nonceCookieOptions = {
    httpOnly: true,
    sameSite: 'lax',
    secure: googleCallbackURL.startsWith('https:'),
    path: '/api/auth/google',
    maxAge: STATE_TTL_SECONDS * 1000,
};

const readCookie = (req, name) => {
    const header = req.headers.cookie;
    if (!header) return undefined;
    for (const part of header.split(';')) {
        const index = part.indexOf('=');
        if (index === -1) continue;
        if (part.slice(0, index).trim() === name) {
            try { return decodeURIComponent(part.slice(index + 1).trim()); } catch { return undefined; }
        }
    }
    return undefined;
};

// Where to send the browser after the Google round-trip: the frontend that
// started the flow (if it is on the allowlist), otherwise FRONTEND_URL.
const frontendFor = (state) =>
    state?.ok && state.origin && isAllowedOrigin(state.origin) ? state.origin : frontendBaseUrl;

// Reason codes are shown to users and must stay short, stable identifiers.
const normalizeReason = (reason) =>
    typeof reason === 'string' && /^[a-z_]{1,40}$/i.test(reason) ? reason.toLowerCase() : 'unknown';

// Map whatever went wrong into a short code that the frontend can show and
// that you can search for in the Render logs.
const failureReason = (err, info, query) => {
    if (query?.error) return query.error;                              // e.g. access_denied (Google-side)
    if (info?.reason) return info.reason;                               // e.g. no_email, email_not_verified
    if (!err) return 'denied';
    if (err.name === 'TokenError') return err.code || 'token_error';    // invalid_client, invalid_grant, redirect_uri_mismatch...
    if (err.name === 'AuthorizationError') return err.code || 'authorization_error';
    if (err.name === 'InternalOAuthError') return 'oauth_exchange_failed';
    if (err.name === 'ValidationError') return 'user_validation_failed';
    return 'server_error';
};

const redirectWithFailure = (res, frontend, reason, detail) => {
    const code = normalizeReason(reason);
    console.error(`[google-oauth] sign-in failed (${code}):`, detail || '');
    const target = new URL('/signin', frontend);
    target.searchParams.set('error', 'google_failed');
    target.searchParams.set('reason', code);
    return res.redirect(target.toString());
};

// Step 1 — kick off Google sign-in.
//   GET /api/auth/google?role=user|vendor&origin=<frontend origin>
authRouter.get('/google', (req, res, next) => {
    const nonce = crypto.randomBytes(16).toString('hex');
    const state = createOAuthState({ role: req.query.role, origin: req.query.origin, nonce });
    res.cookie(NONCE_COOKIE, nonce, nonceCookieOptions);
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        session: false,
        state,
        prompt: 'select_account',
    })(req, res, next);
});

// Step 2 — Google sends the user back here with ?code=...&state=... (or ?error=...).
authRouter.get('/google/callback', (req, res, next) => {
    try {
        const state = verifyOAuthState(req.query.state);
        const frontend = frontendFor(state);
        const nonce = readCookie(req, NONCE_COOKIE);
        res.clearCookie(NONCE_COOKIE, { path: nonceCookieOptions.path });

        // Google-side refusal (user cancelled, app in Testing and user not a tester...).
        if (req.query.error) {
            return redirectWithFailure(res, frontend, req.query.error, req.query.error_description);
        }
        // Refuse to exchange any code unless this browser demonstrably started the flow.
        if (!state.ok) {
            return redirectWithFailure(res, frontend, state.reason, 'state could not be verified');
        }
        if (!nonceMatches(nonce, state.nonceHash)) {
            return redirectWithFailure(res, frontend, 'state_mismatch', nonce ? 'nonce cookie does not match state' : 'nonce cookie missing (cookies blocked, or callback opened in a different browser)');
        }
        req.oauthState = state;

        passport.authenticate('google', { session: false }, (err, result, info) => {
            try {
                if (err || !result) {
                    if (err?.oauthError) console.error('[google-oauth] provider response:', err.oauthError?.data || err.oauthError);
                    return redirectWithFailure(res, frontend, failureReason(err, info, req.query), err?.message || info?.message);
                }
                const { token, user } = result;
                // Credentials travel in the URL *fragment*: fragments are never sent to
                // the frontend's server/CDN or written to access logs, unlike ?query.
                const target = new URL('/auth/callback', frontend);
                target.hash = new URLSearchParams({ token, role: user.role, name: user.name }).toString();
                return res.redirect(target.toString());
            } catch (error) {
                next(error);
            }
        })(req, res, next);
    } catch (error) {
        next(error);
    }
});

export default authRouter;
