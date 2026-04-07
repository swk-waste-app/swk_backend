import Joi from 'joi';

export const addProductValidator = Joi.object({
    title: Joi.string().required(),
    description: Joi.string(),
    price: Joi.number(),
    category: Joi.string(),
    inventory: Joi.number(),
    image: Joi.string(),
    condition: Joi.string().valid('New', 'Like New', 'Good', 'Fair').default('Good'),
    wasteType: Joi.string().valid('Bottles', 'Papers', 'Organic Fertilizer', 'Fashion & Textiles', 
               'Electronics', 'Metals', 'Plastics', 'Glass', 'Wood', 'Other'),
    location: Joi.string(),
    tags: Joi.array().items(Joi.string()),
});

export const updateProductValidator = Joi.object({
    title: Joi.string(),
    description: Joi.string(),
    price: Joi.number(),
    category: Joi.string(),
    inventory: Joi.number(),
    image: Joi.string(),
    condition: Joi.string().valid('New', 'Like New', 'Good', 'Fair'),
    wasteType: Joi.string().valid('Bottles', 'Papers', 'Organic Fertilizer', 'Fashion & Textiles', 
               'Electronics', 'Metals', 'Plastics', 'Glass', 'Wood', 'Other'),
    location: Joi.string(),
    isAvailable: Joi.boolean(),
    tags: Joi.array().items(Joi.string()),
    rating: Joi.number().min(0).max(5),
    totalRatings: Joi.number(),
    sold: Joi.number(),
});