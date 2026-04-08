import { Schema, model } from 'mongoose';
import { toJSON } from '@reis/mongoose-to-json';

const WASTE_TYPES = ['General Waste', 'Recyclable Materials', 'Organic/Food Waste', 
    'Electronic (E-Waste)', 'Hazardous Waste', 'Fashion & Textiles', 
    'Plastics', 'Metals & Scrap', 'Glass', 'Wood & Furniture', 
    'Paper & Cardboard', 'Rubber', 'Other'];

const productSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    price: { type: Number },
    category: { type: String },
    inventory: { type: Number, default: 0 },
    image: { type: String },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    // Enhanced fields
    condition: { 
        type: String, 
        enum: ['New', 'Like New', 'Good', 'Fair'],
        default: 'Good'
    },
    wasteType: { type: String, enum: WASTE_TYPES },
    location: { type: String },
    views: { type: Number, default: 0 },
    sold: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
    isAvailable: { type: Boolean, default: true },
    tags: [{ type: String }],
    // Upcycling specific fields
    beforeImage: { type: String },
    afterImage: { type: String },
    upcyclingStory: { type: String },
    materialsUsed: [{ type: String }],
    wasteSourced: { type: String },
    processDescription: { type: String },
    timeToMake: { type: String },
    isUpcycled: { type: Boolean, default: false },
}, {
    timestamps: true,
});

productSchema.index({ title: 'text', category: 'text', description: 'text', upcyclingStory: 'text' });
productSchema.plugin(toJSON);
export const ProductModel = model('Product', productSchema);