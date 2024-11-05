import Joi from 'joi';

export const addProductValidator = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().optional(),
    price: Joi.number().positive(),
    category: Joi.string(),
    inventory: Joi.number().integer().min(0).optional(),
    image: Joi.string().optional(),
});

export const updateProductValidator = Joi.object({
    title: Joi.string().optional(),
    description: Joi.string().optional(),
    price: Joi.number().positive().optional(),
    category: Joi.string().optional(),
    inventory: Joi.number().integer().min(0).optional(),
    image: Joi.string().optional(),
});