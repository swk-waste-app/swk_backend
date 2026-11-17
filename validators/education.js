import Joi from 'joi';
import { EDUCATION_CATEGORIES } from '../models/education.js';

export const addEducationValidator = Joi.object({
    title: Joi.string().required(),
    category: Joi.string().valid(...EDUCATION_CATEGORIES).default('General'),
    summary: Joi.string().max(300).required(),
    content: Joi.string().required(),
    image: Joi.string().allow(''),
    // A multipart form sends one tag as a plain string and several as a list.
    tags: Joi.array().items(Joi.string().trim().max(40)).single(),
});

export const updateEducationValidator = Joi.object({
    title: Joi.string(),
    category: Joi.string().valid(...EDUCATION_CATEGORIES),
    summary: Joi.string().max(300),
    content: Joi.string(),
    image: Joi.string().allow(''),
    tags: Joi.array().items(Joi.string().trim().max(40)).single(),
});
