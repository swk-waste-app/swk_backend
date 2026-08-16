import { Schema, model } from 'mongoose';
import { toJSON } from '@reis/mongoose-to-json';

export const EDUCATION_CATEGORIES = [
    'Recycling Tips',
    'Composting',
    'Waste Sorting',
    'Sustainability',
    'Workshops',
    'General',
];

const educationSchema = new Schema({
    title: { type: String, required: true },
    category: { type: String, enum: EDUCATION_CATEGORIES, default: 'General' },
    summary: { type: String, required: true },
    content: { type: String, required: true },
    image: { type: String },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tags: [{ type: String }],
}, {
    timestamps: true,
});

educationSchema.index({ title: 'text', summary: 'text', content: 'text' });
educationSchema.plugin(toJSON);
export const EducationModel = model('Education', educationSchema);
