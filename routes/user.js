import { Router } from 'express';
import { registerUser, loginUser, getProfile, getAllProfiles, updateProfile, getUserProducts, getUserSchedules } from '../controllers/user.js';
import { userProfileImageUpload } from '../middlewares/uploads.js';
import { isAuthenticated, hasPermission } from '../middlewares/auth.js';

const userRouter = Router();


userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.get('/profile', isAuthenticated, hasPermission('get_profile'), getProfile);
userRouter.get('/profiles', isAuthenticated, hasPermission('get_all_profiles'), getAllProfiles);
userRouter.get('/products', isAuthenticated, hasPermission('view_products'), getUserProducts);
userRouter.get('/me/products', isAuthenticated, hasPermission('get_users_products'), getUserProducts);
userRouter.get('/me/schedules', isAuthenticated, hasPermission('get_users_schedules'), getUserSchedules)
userRouter.patch('/profile', isAuthenticated, hasPermission('update_profile'), userProfileImageUpload.single('avatar'), updateProfile);

export default userRouter;

