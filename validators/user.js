import Joi from 'joi';

export const registerUserValidator = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    location: Joi.string(),
    role: Joi.string().valid('user', 'vendor', 'admin').default('user') // no longer required
});

export const loginUserValidator = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

export const updateProfileValidator = Joi.object({
    name: Joi.string(),
    avatar: Joi.string()
});