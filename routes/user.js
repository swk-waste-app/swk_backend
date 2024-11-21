import { Router } from 'express';
import { registerUser, loginUser, getProfile, getAllProfiles, updateProfile, getUserProducts, getUserSchedules } from '../controllers/user.js';
import { userProfileImageUpload } from '../middlewares/uploads.js';
import { isAuthenticated, hasPermission } from '../middlewares/auth.js';

const userRouter = Router();


userRouter.post('/users/register', registerUser);


userRouter.post('/users/login', loginUser);

userRouter.get('/users/profile', isAuthenticated, hasPermission('get_profile'), getProfile);

userRouter.get('/users/profiles', isAuthenticated, hasPermission('get_all_profiles'), getAllProfiles);

userRouter.get('/users/products', isAuthenticated, hasPermission('view_products'), getUserProducts);

userRouter.get('/users/me/products', isAuthenticated, hasPermission, getUserProducts);

userRouter.get('/users/me/schedules', isAuthenticated, hasPermission, getUserSchedules)

userRouter.patch('/users/profile', isAuthenticated, hasPermission('update_profile'), userProfileImageUpload.single('avatar'), updateProfile);

export default userRouter;

