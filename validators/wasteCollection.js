import Joi from 'joi';

export const schedulePickupValidator = Joi.object({
    pickupDate: Joi.date().required(),
    location: Joi.string().required(),
});
