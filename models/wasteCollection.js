import { Schema, model } from 'mongoose';

export const WASTE_TYPES = ['General Waste', 'Recyclable Materials', 'Organic/Food Waste',
    'Electronic (E-Waste)', 'Hazardous Waste', 'Fashion & Textiles',
    'Plastics', 'Metals & Scrap', 'Glass', 'Wood & Furniture',
    'Paper & Cardboard', 'Rubber', 'Other'];

export const PICKUP_STATUSES = ['Scheduled', 'In Progress', 'Completed', 'Cancelled'];

const wasteCollectionSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    pickupDate: { type: Date, required: true },
    location: { type: String, required: true },
    status: {
        type: String,
        enum: PICKUP_STATUSES,
        default: 'Scheduled'
    },
    wasteType: {
        type: String,
        enum: WASTE_TYPES,
        default: 'General Waste'
    },
    estimatedWeight: { type: Number, default: 0 },
    actualWeight: { type: Number, default: 0 },
    pointsEarned: { type: Number, default: 0 },
    carbonSaved: { type: Number, default: 0 },
    notes: { type: String },
    agentName: { type: String },
    completedAt: { type: Date },
    rating: { type: Number, min: 1, max: 5 },
    feedback: { type: String },
}, {
    timestamps: true,
});

// The operations queue lists pickups newest first and the summary counts
// them by status and day; a household's own list filters by user.
wasteCollectionSchema.index({ pickupDate: -1 });
wasteCollectionSchema.index({ status: 1, pickupDate: 1 });
wasteCollectionSchema.index({ user: 1, createdAt: -1 });

export const wasteCollectionModel = model('WasteCollection', wasteCollectionSchema);
