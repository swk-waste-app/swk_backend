import { Schema, model } from 'mongoose';
import { toJSON } from '@reis/mongoose-to-json';

const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    location: { type: String },
    role: { type: String, enum: ['user', 'vendor', 'admin'], default: 'user' },
    profileImage: { type: String },
    contactNumber: { type: String },
    // Gamification & Impact
    points: { type: Number, default: 0 },
    wasteCollected: { type: Number, default: 0 }, // in kg
    carbonSaved: { type: Number, default: 0 }, // in kg CO2
    streak: { type: Number, default: 0 }, // consecutive weeks active
    totalPickups: { type: Number, default: 0 },
    completedPickups: { type: Number, default: 0 },
    // Vendor specific
    totalProducts: { type: Number, default: 0 },
    totalSales: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    // Badge/Level system
    level: { type: String, enum: ['Beginner', 'Recycler', 'Eco Warrior', 'Green Champion', 'Earth Guardian'], default: 'Beginner' },
    badges: [{ type: String }],
}, {
    timestamps: true,
});

userSchema.plugin(toJSON);
export const UserModel = model('User', userSchema);