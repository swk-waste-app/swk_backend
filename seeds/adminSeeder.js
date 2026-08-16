import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserModel } from '../models/user.js';
import dotenv from 'dotenv';
dotenv.config();

const email = process.env.SEED_ADMIN_EMAIL;
const password = process.env.SEED_ADMIN_PASSWORD;

if (!email || !password) {
    console.error('Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in .env before running this seeder.');
    process.exit(1);
}
if (password.length < 8) {
    console.error('SEED_ADMIN_PASSWORD must be at least 8 characters.');
    process.exit(1);
}

await mongoose.connect(process.env.MONGO_URI);

const adminExists = await UserModel.findOne({ email });

if (adminExists) {
    console.log('Admin already exists');
} else {
    await UserModel.create({
        name: 'SWK Admin',
        email,
        password: bcrypt.hashSync(password, 10),
        role: 'admin'
    });
    console.log('Admin created successfully!');
}

await mongoose.disconnect();
