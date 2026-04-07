import Joi from 'joi';

export const schedulePickupValidator = Joi.object({
    pickupDate: Joi.date().required(),
    location: Joi.string().required(),
    wasteType: Joi.string().valid('General', 'Recyclable', 'Organic', 'Electronic', 'Hazardous').default('General'),
    estimatedWeight: Joi.number().default(0),
    notes: Joi.string().allow(''),
});

export const updatePickupValidator = Joi.object({
    pickupDate: Joi.date(),
    location: Joi.string(),
    status: Joi.string().valid('Scheduled', 'In Progress', 'Completed', 'Cancelled'),
    wasteType: Joi.string().valid('General', 'Recyclable', 'Organic', 'Electronic', 'Hazardous'),
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