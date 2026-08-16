import Joi from 'joi';

export const sendMessageValidator = Joi.object({
    subject: Joi.string().trim().min(1).max(150).required(),
    message: Joi.string().trim().min(1).max(2000).required(),
});
