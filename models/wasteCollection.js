import { Schema, model } from 'mongoose';

const wasteCollectionSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    pickupDate: { type: Date, required: true },
    location: { type: String, required: true },
    status: { type: String, enum: ['Scheduled', 'Completed'], default: 'Scheduled' }
}, {
    timestamps: true,
});

export const WasteCollectionModel = model('WasteCollection', wasteCollectionSchema);
