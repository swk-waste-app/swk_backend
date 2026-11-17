import Joi from 'joi';
import { WASTE_TYPES, PICKUP_STATUSES } from '../models/wasteCollection.js';

// A pickup cannot be booked in the past (five minutes of clock slack).
const notInThePast = (value, helpers) =>
    value.getTime() < Date.now() - 5 * 60 * 1000 ? helpers.message('pickupDate cannot be in the past') : value;

export const schedulePickupValidator = Joi.object({
    pickupDate: Joi.date().required().custom(notInThePast),
    location: Joi.string().trim().max(200).required(),
    wasteType: Joi.string().valid(...WASTE_TYPES).default('General Waste'),
    estimatedWeight: Joi.number().min(0).max(10000).default(0),
    notes: Joi.string().max(500).allow(''),
});

// Operations editing a pickup's details. Status, points and completion are
// deliberately absent: they are only set through PATCH /:id/status, which
// applies the rules (award points once, never reopen a closed pickup).
export const updatePickupValidator = Joi.object({
    pickupDate: Joi.date(),
    location: Joi.string().trim().max(200),
    wasteType: Joi.string().valid(...WASTE_TYPES),
    estimatedWeight: Joi.number().min(0),
    notes: Joi.string().max(500).allow(''),
    agentName: Joi.string().trim().max(80).allow(''),
    rating: Joi.number().min(1).max(5),
    feedback: Joi.string().max(1000).allow(''),
});

// Used when a non-admin edits their own schedule: excludes status and the
// gamification fields (pointsEarned, carbonSaved, agentName, completedAt)
// which only the admin-only status endpoint is allowed to set.
export const userUpdatePickupValidator = Joi.object({
    pickupDate: Joi.date().custom(notInThePast),
    location: Joi.string().trim().max(200),
    wasteType: Joi.string().valid(...WASTE_TYPES),
    estimatedWeight: Joi.number().min(0).max(10000),
    notes: Joi.string().max(500).allow(''),
    rating: Joi.number().min(1).max(5),
    feedback: Joi.string().max(1000).allow(''),
});

// Body of PATCH /waste-collection/:id/status (operations only).
export const updatePickupStatusValidator = Joi.object({
    status: Joi.string().valid(...PICKUP_STATUSES).required(),
    // Weight measured at collection, in kg. Points are awarded from it.
    actualWeight: Joi.number().min(0),
    // Collector or crew handling the pickup. An empty string clears it.
    agentName: Joi.string().trim().max(80).allow(''),
});
