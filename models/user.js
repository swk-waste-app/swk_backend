import { Schema, model } from 'mongoose';
import { toJSON } from '@reis/mongoose-to-json';
const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    location: { type: String },
    role: { type: String, enum: ['user', 'vendor', 'admin'], default: 'user' },
    profileImage: { type: String }
}, {
    timestamps: true,
});

userSchema.plugin(toJSON);

export const UserModel = model('User', userSchema);
