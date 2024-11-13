import Joi from 'joi';

// Validator for user registration
export const registerUserValidator = Joi.object({
    name: Joi.string().required(),            
    email: Joi.string().email().required(),    
    password: Joi.string().min(6).required(), 
    contactNumber: Joi.number(),
    businessName: Joi.string(),
    role: Joi.string().valid('user', 'vendor', 'admin').optional
});

// Validator for user login
export const loginUserValidator = Joi.object({
    email: Joi.string().email().required(),    
    password: Joi.string().required()         
});

// Validator for updating user profile
export const updateProfileValidator = Joi.object({
    name: Joi.string(),                       
    avatar: Joi.string()                       
});


