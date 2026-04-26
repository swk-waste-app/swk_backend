import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { registerUser, loginUser, getProfile, getAllProfiles, updateProfile, getUserProducts, getUserSchedules, getUserStats, getLeaderboard, getPublicVendorProfile } from '../controllers/user.js';
import { userProfileImageUpload } from '../middlewares/uploads.js';
import { isAuthenticated, hasPermission } from '../middlewares/auth.js';

const userRouter = Router();

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { message: 'Too many attempts, please try again in 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});

userRouter.post('/register', authLimiter, registerUser);
userRouter.post('/login', authLimiter, loginUser);
userRouter.get('/profile', isAuthenticated, hasPermission('get_profile'), getProfile);
userRouter.get('/profiles', isAuthenticated, hasPermission('get_all_profiles'), getAllProfiles);
userRouter.get('/products', isAuthenticated, hasPermission('view_products'), getUserProducts);
userRouter.get('/me/products', isAuthenticated, hasPermission('get_users_products'), getUserProducts);
userRouter.get('/me/schedules', isAuthenticated, hasPermission('get_users_schedules'), getUserSchedules);
userRouter.get('/me/stats', isAuthenticated, getUserStats);
userRouter.get('/leaderboard', isAuthenticated, getLeaderboard);
userRouter.patch('/profile', isAuthenticated, hasPermission('update_profile'), userProfileImageUpload.single('avatar'), updateProfile);

userRouter.get('/:id/public', getPublicVendorProfile);

export default userRouter;