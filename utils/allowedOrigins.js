// Frontend origins that may call this API (CORS) and that Google sign-in is
// allowed to redirect back to after authentication.
//
// FRONTEND_URL (env) is always included, so a deployment only needs to set
// that one variable for its own frontend to be trusted.

const normalize = (value) => {
    if (!value) return null;
    try {
        const url = new URL(value);
        // Only web origins count; e.g. 'localhost:5173' parses as scheme 'localhost:'
        // with origin 'null', which must not be accepted.
        if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
        return url.origin;
    } catch {
        return null;
    }
};

// FRONTEND_URL must be an absolute URL (scheme + host). A value like
// "takakipawa.swkghana.org" or "localhost:5173" would silently break every
// post-login redirect, so refuse to start rather than misbehave at runtime.
const rawFrontendUrl = process.env.FRONTEND_URL;
if (rawFrontendUrl && !normalize(rawFrontendUrl)) {
    throw new Error(
        `FRONTEND_URL="${rawFrontendUrl}" is not a valid absolute URL. ` +
        'Use the full origin, e.g. http://localhost:5173 or https://takakipawa.swkghana.org'
    );
}

// Origin the backend redirects to after Google sign-in when the originating
// frontend is unknown or not on the allowlist.
export const frontendBaseUrl = normalize(rawFrontendUrl) || 'http://localhost:5173';

const configured = [
    'http://localhost:5173',
    'https://takakipawa.swkghana.org',
    'https://swkfrontend.vercel.app',
    frontendBaseUrl,
];

export const allowedOrigins = [...new Set(configured.map(normalize).filter(Boolean))];

export const isAllowedOrigin = (origin) => allowedOrigins.includes(normalize(origin));
