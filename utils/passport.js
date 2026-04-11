import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { UserModel } from '../models/user.js';
import jwt from 'jsonwebtoken';

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback',
    scope: ['profile', 'email']
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.emails[0].value;
        const name = profile.displayName;

        // Check if user already exists
        let user = await UserModel.findOne({ email });

        if (!user) {
            // Create new user with google account
            user = await UserModel.create({
                name,
                email,
                password: `google_${profile.id}`,
                role: 'user',
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_PRIVATE_KEY,
            { expiresIn: '24h' }
        );

        return done(null, { user, token });
    } catch (error) {
        return done(error, null);
    }
}));

export default passport;