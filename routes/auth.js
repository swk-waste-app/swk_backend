import { Router } from 'express';
import passport from '../utils/passport.js';

const authRouter = Router();

// Initiate Google OAuth
authRouter.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false
}));

// Google OAuth callback
authRouter.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/signin?error=google_failed` }),
    (req, res) => {
        const { token, user } = req.user;
        // Redirect to frontend with token and role
        res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}&role=${user.role}&name=${encodeURIComponent(user.name)}`);
    }
);

export default authRouter;