# Google sign-in — how it is wired and what must match

## Flow

1. Frontend button calls `startGoogleSignIn(role)` (`swk_frontend/src/services/Auth.js`), which does a
   full-page redirect to `<VITE_BASE_URL>/auth/google?role=<user|vendor>&origin=<frontend origin>`.
2. `GET /api/auth/google` (`routes/auth.js`) creates a random nonce, stores it in an HttpOnly
   `SameSite=Lax` cookie on the backend (`swk_oauth_nonce`, 15 min) and signs `{ role, origin, sha256(nonce) }`
   into the OAuth `state`, then sends the browser to Google with `prompt=select_account`.
3. Google sends the browser back to **`<backend>/api/auth/google/callback`** with `?code=…&state=…`.
4. The callback verifies the signed state **and** that the nonce cookie matches it *before* exchanging the
   code (login-CSRF guard). `utils/passport.js` then:
   - refuses unverified Google emails,
   - matches an existing account by `googleId`, else by (case-insensitive) email and links it,
   - otherwise creates the account with the role from `state` (`user`/`vendor` only, never `admin`),
   - signs the normal 24h JWT.
5. The browser is redirected to `<origin or FRONTEND_URL>/auth/callback#token=…&role=…&name=…`
   (URL **fragment**, so the token never reaches the frontend host's logs).
6. `swk_frontend/src/pages/auth/GoogleCallback.jsx` reads the fragment, stores `token` + `role` in
   localStorage and routes to the right dashboard.

On any failure the backend logs `[google-oauth] sign-in failed (<reason>)` and redirects to
`<frontend>/signin?error=google_failed&reason=<reason>`; the sign-in page shows a message for known codes.

| reason                    | meaning / fix                                                                  |
|---------------------------|--------------------------------------------------------------------------------|
| `access_denied`           | user cancelled, **or** consent screen is in *Testing* and the account is not a listed test user |
| `invalid_client`          | `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` on the server do not match the Google client |
| `invalid_grant`           | code already used / expired (usually a double callback or clock skew)          |
| `redirect_uri_mismatch`   | the callback URL printed at boot is not an Authorized redirect URI in Google Cloud Console |
| `state_missing` / `state_invalid` / `state_expired` | callback opened without a valid signed state (took >15 min, tampered, or a bookmarked URL) |
| `state_mismatch`          | nonce cookie absent or different: cookies blocked, or the callback URL was opened in another browser |
| `no_email`                | Google did not return an email for the account                                  |
| `email_not_verified`      | Google reports the address as unverified; refused for both new and existing accounts |
| `email_linked_elsewhere`  | that email's account is already linked to a *different* Google account          |
| `user_validation_failed`  | Mongo validation error creating the user (see server log)                       |
| `server_error`            | anything else (see server log)                                                  |

## Environment variables (backend)

| variable               | local (`.env`)                | Render dashboard                                          |
|------------------------|-------------------------------|-----------------------------------------------------------|
| `GOOGLE_CLIENT_ID`     | from Google Cloud Console     | **same** client as local                                  |
| `GOOGLE_CLIENT_SECRET` | from Google Cloud Console     | **same** secret (re-copy after any "reset secret")        |
| `JWT_PRIVATE_KEY`      | any long random string        | set                                                       |
| `FRONTEND_URL`         | `http://localhost:5173`       | `https://takakipawa.swkghana.org` (must be an absolute URL — the server refuses to start otherwise) |
| `BACKEND_URL`          | optional (`http://localhost:6060`) | optional — `RENDER_EXTERNAL_URL` is used automatically; `NODE_ENV=production` also works |
| `PORT`                 | optional (default `6060`)     | set by Render                                             |

The server prints `[google-oauth] callback URL: …` at boot. That exact URL must be listed in Google Cloud Console.

## Google Cloud Console checklist (APIs & Services → Credentials → the OAuth 2.0 Client ID)

- **Authorized redirect URIs** must contain *both*:
  - `http://localhost:6060/api/auth/google/callback`
  - `https://swk-backend.onrender.com/api/auth/google/callback`
- **Authorized JavaScript origins** are not needed for this server-side flow.
- **OAuth consent screen → Publishing status**: while it is *Testing*, only emails listed under
  *Test users* can sign in (everyone else gets `access_denied`). Set it to *In production* (email +
  profile scopes need no verification review) or add every tester.
- Allowed frontend origins for the post-login redirect live in `utils/allowedOrigins.js`
  (plus whatever `FRONTEND_URL` is set to).

## Deploying this change

Deploy the **frontend first** (its `GoogleCallback.jsx` accepts both `#fragment` and `?query`), then the
backend (which now only sends the fragment). Both are backwards compatible with each other in that order.

## Known limitation — account linking

`POST /api/users/register` does not verify that the person owns the email address. Because Google
sign-in links to an existing account with the same verified email, someone could pre-register another
person's address with a password and later still know that password. The proper fix is email
verification on registration (or a "confirm link" step); until then, treat password accounts that were
later linked to Google with that in mind.
