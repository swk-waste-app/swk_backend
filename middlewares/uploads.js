import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export const productImageUpload = multer({
    storage: new CloudinaryStorage({
        cloudinary,
        params: { folder: 'swk-waste-app/products', allowed_formats: ['jpg', 'png', 'jpeg', 'webp'] }
    })
});

export const userProfileImageUpload = multer({
    storage: new CloudinaryStorage({
        cloudinary,
        params: { folder: 'swk-waste-app/users', allowed_formats: ['jpg', 'png', 'jpeg', 'webp'] }
    })
});

export const educationImageUpload = multer({
    storage: new CloudinaryStorage({
        cloudinary,
        params: { folder: 'swk-waste-app/education', allowed_formats: ['jpg', 'png', 'jpeg', 'webp'] }
    })
});