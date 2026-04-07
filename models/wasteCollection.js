import { Schema, model } from 'mongoose';

const wasteCollectionSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    pickupDate: { type: Date, required: true },
    location: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled'], 
        default: 'Scheduled' 
    },
    wasteType: { 
        type: String, 
        enum: ['General', 'Recyclable', 'Organic', 'Electronic', 'Hazardous'],
        default: 'General'
    },
    estimatedWeight: { type: Number, default: 0 }, // in kg
    actualWeight: { type: Number, default: 0 }, // in kg
    pointsEarned: { type: Number, default: 0 },
    carbonSaved: { type: Number, default: 0 }, // in kg CO2
    notes: { type: String },
    agentName: { type: String },
    completedAt: { type: Date },
    rating: { type: Number, min: 1, max: 5 },
    feedback: { type: String },
}, {
    timestamps: true,
});

export const wasteCollectionModel = model('WasteCollection', wasteCollectionSchema);