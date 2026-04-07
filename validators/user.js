import Joi from 'joi';

export const registerUserValidator = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    contactNumber: Joi.number(),
    role: Joi.string().valid('user', 'vendor', 'admin').default('user')
});

export const loginUserValidator = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

export const updateProfileValidator = Joi.object({
    name: Joi.string(),
    avatar: Joi.string()
});