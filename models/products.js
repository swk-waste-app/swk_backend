import { Schema, model } from 'mongoose';
import { toJSON } from '@reis/mongoose-to-json';

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
    wasteType: { 
        type: String,
        enum: ['Bottles', 'Papers', 'Organic Fertilizer', 'Fashion & Textiles', 
               'Electronics', 'Metals', 'Plastics', 'Glass', 'Wood', 'Other']
    },
    location: { type: String },
    views: { type: Number, default: 0 },
    sold: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
    isAvailable: { type: Boolean, default: true },
    tags: [{ type: String }],
}, {
    timestamps: true,
});

productSchema.index({ title: 'text', category: 'text', description: 'text' });
productSchema.plugin(toJSON);
export const ProductModel = model('Product', productSchema);