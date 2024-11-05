import { Schema, model } from 'mongoose';
import { toJSON } from '@reis/mongoose-to-json';

const productSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    inventory: { type: Number, default: 0 },
    image: { type: String },
    vendor: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, {
    timestamps: true,
});

productSchema.index({ title: 'text', category: 'text' });
productSchema.plugin(toJSON)
export const ProductModel = model('Product', productSchema);
