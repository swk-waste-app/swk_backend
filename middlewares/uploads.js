// upload.js
import multer from 'multer';
import { multerSaveFilesOrg } from 'multer-savefilesorg';

// Middleware for uploading product images
export const productImageUpload = multer({
    storage: multerSaveFilesOrg({
        apiAccessToken: process.env.SAVEFILESORG_API_KEY,
        relativePath: '/swk-waste-app/products/*' // Path for storing product images
    }),
    preservePath: true
});

// Middleware for uploading user profile images
export const userProfileImageUpload = multer({
    storage: multerSaveFilesOrg({
        apiAccessToken: process.env.SAVEFILESORG_API_KEY,
        relativePath: '/swk-waste-app/users/*' // Path for storing user profile images
    }),
    preservePath: true
});

// Middleware for uploading educational content images
export const educationImageUpload = multer({
    storage: multerSaveFilesOrg({
        apiAccessToken: process.env.SAVEFILESORG_API_KEY,
        relativePath: '/swk-waste-app/education/*' // Path for storing educational content images
    }),
    preservePath: true
});
