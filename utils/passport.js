import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { UserModel } from '../models/user.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const callbackURL = process.env.NODE_ENV === 'production'
    ? 'https://swk-backend.onrender.com/api/auth/google/callback'
    : 'http://localhost:6060/api/auth/google/callback';

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: callbackURL,
    scope: ['profile', 'email']
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.emails[0].value;
        const name = profile.displayName;
        let user = await UserModel.findOne({ email });
        if (!user) {
            user = await UserModel.create({
                name,
                email,
                // Google-authenticated users never log in with a password; store an
                // unguessable, bcrypt-hashed value so the field can't be brute-forced
                // or used as a predictable credential via the regular login endpoint.
                password: bcrypt.hashSync(crypto.randomBytes(32).toString('hex'), 10),
                role: 'user',
            });
        }
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
