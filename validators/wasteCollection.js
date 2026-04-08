import Joi from 'joi';

const WASTE_TYPES = ['General Waste', 'Recyclable Materials', 'Organic/Food Waste',
    'Electronic (E-Waste)', 'Hazardous Waste', 'Fashion & Textiles',
    'Plastics', 'Metals & Scrap', 'Glass', 'Wood & Furniture',
    'Paper & Cardboard', 'Rubber', 'Other'];

export const schedulePickupValidator = Joi.object({
    pickupDate: Joi.date().required(),
    location: Joi.string().required(),
    wasteType: Joi.string().valid(...WASTE_TYPES).default('General Waste'),
    estimatedWeight: Joi.number().default(0),
    notes: Joi.string().allow(''),
});

export const updatePickupValidator = Joi.object({
    pickupDate: Joi.date(),
    location: Joi.string(),
    status: Joi.string().valid('Scheduled', 'In Progress', 'Completed', 'Cancelled'),
    wasteType: Joi.string().valid(...WASTE_TYPES),
    estimatedWeight: Joi.number(),
    actualWeight: Joi.number(),
    pointsEarned: Joi.number(),
    carbonSaved: Joi.number(),
    notes: Joi.string().allow(''),
    agentName: Joi.string().allow(''),
    completedAt: Joi.date(),
    rating: Joi.number().min(1).max(5),
    feedback: Joi.string().allow(''),
});