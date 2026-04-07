import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserModel } from '../models/user.js';
import dotenv from 'dotenv';
dotenv.config();

await mongoose.connect(process.env.MONGO_URI);

const adminExists = await UserModel.findOne({ email: 'admin@swkghana.org' });

if (adminExists) {
    console.log('Admin already exists');
} else {
    await UserModel.create({
        name: 'SWK Admin',
        email: 'admin@swkghana.org',
        password: bcrypt.hashSync('SWK@admin2024', 10),
        role: 'admin'
    });
    console.log('Admin created successfully!');
}

await mongoose.disconnect();