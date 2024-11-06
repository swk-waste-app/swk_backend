import Joi from 'joi';

export const addProductValidator = Joi.object({
    title: Joi.string().required(),
    description: Joi.string(),
    price: Joi.string(),
    category: Joi.string(),
    inventory: Joi.number(),
    image: Joi.string(),
});

export const updateProductValidator = Joi.object({
    title: Joi.string(),
    description: Joi.string(),
    price: Joi.string(),
    category: Joi.string(),
    inventory: Joi.number(),
    image: Joi.string(),
});
