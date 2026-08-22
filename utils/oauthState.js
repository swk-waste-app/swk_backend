import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { isAllowedOrigin } from './allowedOrigins.js';

// The OAuth `state` parameter round-trips through Google and comes back on the
// callback. We use it to carry:
//   - role    : which role the person picked on the sign-in page
//   - origin  : which frontend origin started the flow (localhost vs. production)
//   - nonce   : sha256 of a random value that is ALSO stored in an HttpOnly
//               cookie on the backend, so the callback can prove the browser
//               finishing the flow is the one that started it (login-CSRF guard).
//
// It is signed so none of that can be tampered with. The signing key is
// *derived* from JWT_PRIVATE_KEY rather than being the key itself, so a state
// token can never be replayed as a Bearer login token (and vice versa).

export const STATE_TTL_SECONDS = 15 * 60;
const SELF_SERVICE_ROLES = ['user', 'vendor']; // 'admin' is intentionally excluded

const stateKey = () =>
    crypto.createHmac('sha256', process.env.JWT_PRIVATE_KEY).update('google-oauth-state').digest();

export const hashNonce = (nonce) => crypto.createHash('sha256').update(String(nonce)).digest('hex');

export const createOAuthState = ({ role, origin, nonce }) => {
    const payload = {
        purpose: 'google_oauth',
        role: SELF_SERVICE_ROLES.includes(role) ? role : 'user',
        nonce: hashNonce(nonce),
    };
    if (isAllowedOrigin(origin)) payload.origin = new URL(origin).origin;
    return jwt.sign(payload, stateKey(), { expiresIn: STATE_TTL_SECONDS });
};

// Returns { ok: true, role, origin?, nonceHash } or { ok: false, reason }.
export const verifyOAuthState = (state) => {
    if (!state || typeof state !== 'string') return { ok: false, reason: 'state_missing' };
    try {
        const payload = jwt.verify(state, stateKey());
        if (payload.purpose !== 'google_oauth' || typeof payload.nonce !== 'string') {
            return { ok: false, reason: 'state_invalid' };
        }
        return {
            ok: true,
            role: SELF_SERVICE_ROLES.includes(payload.role) ? payload.role : 'user',
            origin: isAllowedOrigin(payload.origin) ? payload.origin : undefined,
            nonceHash: payload.nonce,
        };
    } catch (error) {
        return { ok: false, reason: error?.name === 'TokenExpiredError' ? 'state_expired' : 'state_invalid' };
    }
};

// Constant-time comparison of the cookie nonce against the hash carried in state.
export const nonceMatches = (nonce, nonceHash) => {
    if (!nonce || !nonceHash) return false;
    const a = Buffer.from(hashNonce(nonce));
    const b = Buffer.from(String(nonceHash));
    return a.length === b.length && crypto.timingSafeEqual(a, b);
};
