import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { UserModel } from '../models/user.js';
import { frontendBaseUrl } from './allowedOrigins.js';

// ---------------------------------------------------------------------------
// Configuration checks — fail loudly at startup with an actionable message
// instead of the cryptic "OAuth2Strategy requires a clientID option".
// ---------------------------------------------------------------------------
const missing = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'JWT_PRIVATE_KEY'].filter((key) => !process.env[key]);
if (missing.length) {
    throw new Error(
        `Google sign-in is not configured: missing ${missing.join(', ')}. ` +
        'Set them in swk_backend/.env for local development or in the Render dashboard for production.'
    );
}
if (!process.env.FRONTEND_URL) {
    console.warn(`[google-oauth] FRONTEND_URL is not set; defaulting to ${frontendBaseUrl} for post-login redirects.`);
}

// The public URL of THIS backend. Google must be told exactly where to send the
// user back, and that URL has to be listed under "Authorized redirect URIs" for
// the OAuth client in Google Cloud Console.
//   - BACKEND_URL            explicit override (recommended)
//   - RENDER_EXTERNAL_URL    injected automatically by Render
//   - NODE_ENV=production    legacy fallback to the known Render hostname
const backendBaseUrl = (
    process.env.BACKEND_URL ||
    process.env.RENDER_EXTERNAL_URL ||
    (process.env.NODE_ENV === 'production' ? 'https://swk-backend.onrender.com' : 'http://localhost:' + (process.env.PORT || 6060))
).replace(/[/]+$/, '');

export const googleCallbackURL = `${backendBaseUrl}/api/auth/google/callback`;
console.log(`[google-oauth] callback URL: ${googleCallbackURL} (must be an Authorized redirect URI for client ${process.env.GOOGLE_CLIENT_ID.slice(0, 12)}...)`);

// Case-insensitive lookup so "Foo@Gmail.com" registered with a password and
// "foo@gmail.com" coming from Google resolve to the same account. Sorted so the
// result is deterministic even if duplicates differing only by case exist.
const findUserByEmail = (email) =>
    UserModel.findOne({ email }).collation({ locale: 'en', strength: 2 }).sort({ createdAt: 1 });

const issueToken = (user) => jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_PRIVATE_KEY,
    { expiresIn: '24h' }
);

// Resolve (or create) the local account for a Google profile.
// Returns { user } on success or { reason } when sign-in must be refused.
const resolveUser = async (profile, state) => {
    const primaryEmail = profile.emails?.[0];
    const email = primaryEmail?.value?.trim().toLowerCase();
    if (!email) return { reason: 'no_email' };

    // Only accept addresses Google has verified. This protects both linking to
    // an existing account and creating a new one under someone else's address.
    if (primaryEmail.verified !== true) return { reason: 'email_not_verified' };

    // 1) Already linked to this Google account -> deterministic match.
    let user = await UserModel.findOne({ googleId: profile.id });
    if (user) return { user };

    // 2) An account with the same (verified) email exists -> link it.
    //    NOTE: /api/users/register does not verify email ownership, so someone
    //    could pre-register another person's address with a password; linking
    //    here would then hand the Google user that pre-made account. Adding
    //    email verification to registration is the real fix (see GOOGLE_SIGNIN.md).
    user = await findUserByEmail(email);
    if (user) {
        if (user.googleId && user.googleId !== profile.id) return { reason: 'email_linked_elsewhere' };
        if (!user.googleId) {
            user.googleId = profile.id;
            await user.save();
        }
        return { user };
    }

    // 3) Brand-new account. Role comes from the signed state (user|vendor only)
    //    and is applied only at creation time.
    user = await UserModel.create({
        name: profile.displayName || email.split('@')[0],
        email,
        googleId: profile.id,
        // Google-authenticated users never log in with a password; store an
        // unguessable, bcrypt-hashed value so the field can't be brute-forced
        // or used as a predictable credential via the regular login endpoint.
        password: bcrypt.hashSync(crypto.randomBytes(32).toString('hex'), 10),
        role: state?.role || 'user',
        profileImage: profile.photos?.[0]?.value,
    });
    return { user };
};

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: googleCallbackURL,
    scope: ['profile', 'email'],
    passReqToCallback: true,
}, async (req, accessToken, refreshToken, profile, done) => {
    // req.oauthState is attached by routes/auth.js after it has verified the
    // signed state AND matched it against the browser's nonce cookie.
    const state = req.oauthState;

    // Do all the work inside try/catch but call done() exactly once, outside
    // it, so an exception thrown by a downstream handler can never trigger a
    // second done() call.
    let outcome;
    try {
        outcome = await resolveUser(profile, state);
    } catch (error) {
        return done(error);
    }
    if (!outcome.user) return done(null, false, { reason: outcome.reason });
    return done(null, { user: outcome.user, token: issueToken(outcome.user), origin: state?.origin });
}));

export default passport;
