import Joi from 'joi';

export const registerUserValidator = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    // Kept as text: a phone number is not a quantity, and a leading zero matters.
    contactNumber: Joi.string().trim().pattern(/^\+?[0-9]{7,15}$/).messages({
        'string.pattern.base': 'contactNumber must be 7 to 15 digits',
    }),
    role: Joi.string().valid('user', 'vendor').default('user')
});

export const loginUserValidator = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

export const updateProfileValidator = Joi.object({
    name: Joi.string(),
    avatar: Joi.string()
});