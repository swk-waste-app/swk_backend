import { isValidObjectId } from 'mongoose';
import { wasteCollectionModel, PICKUP_STATUSES } from '../models/wasteCollection.js';
import { UserModel } from '../models/user.js';
import {
    schedulePickupValidator,
    updatePickupValidator,
    userUpdatePickupValidator,
    updatePickupStatusValidator,
} from '../validators/wasteCollection.js';
import { notify } from '../utils/notify.js';
import { parseSort, parseCount } from '../utils/query.js';
import { nextStreak } from '../utils/streak.js';

const formatPickupDate = (date) =>
    new Date(date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

// Must match the ladder the dashboard shows (swk_frontend Overview.jsx LEVELS).
const LEVELS = [
    { name: 'Beginner', min: 0 },
    { name: 'Recycler', min: 100 },
    { name: 'Eco Warrior', min: 300 },
    { name: 'Green Champion', min: 600 },
    { name: 'Earth Guardian', min: 1000 },
];

const getLevel = (points) =>
    [...LEVELS].reverse().find(l => points >= l.min)?.name || 'Beginner';

const POINTS_PER_KG = 10;
// Estimated kg of CO2e avoided per kg of waste collected.
const CARBON_KG_PER_KG = 0.21;

// A pickup in one of these states is finished and can no longer change.
const CLOSED_STATUSES = ['Completed', 'Cancelled'];
const CLOSED_MESSAGE = {
    Completed: 'This pickup is already completed and can no longer be changed.',
    Cancelled: 'This pickup was cancelled and can no longer be changed.',
};

// What the operations screens need to know about the household.
const CUSTOMER_FIELDS = 'name email contactNumber location';
const MAX_PAGE_SIZE = 1000;

export const schedulePickup = async (req, res, next) => {
    try {
        const { error, value } = schedulePickupValidator.validate(req.body);
        if (error) return res.status(422).json({ message: error.details[0].message });

        const schedule = await wasteCollectionModel.create({ ...value, user: req.auth.id });
        notify(req.auth.id, {
            type: 'pickup',
            title: 'Pickup scheduled',
            body: `${schedule.wasteType} pickup booked for ${formatPickupDate(schedule.pickupDate)}.`,
            link: `/customerDashboard/schedule/${schedule.id}`,
        });
        res.status(201).json({ message: 'Pickup scheduled successfully' });
    } catch (error) {
        next(error);
    }
};

export const countSchedules = async (req, res, next) => {
    try {
        const count = await wasteCollectionModel.countDocuments();
        res.json({ count });
    } catch (error) {
        next(error);
    }
}

export const getSchedule = async (req, res, next) => {
    try {
        const { id } = req.params;
        const schedule = await wasteCollectionModel.findById(id);
        if (!schedule) return res.status(404).json({ message: 'Schedule not found' });
        if (req.auth.role !== 'admin' && schedule.user.toString() !== req.auth.id) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        res.json(schedule);
    } catch (error) {
        next(error);
    }
}

// Admin-only: every household's pickups, newest pickup date first, with the
// household's contact details. Ownership is enforced by the
// 'view_all_pickups' permission on the route, not here.
export const getPickupHistory = async (req, res, next) => {
    try {
        const sort = parseSort(req.query.sort, { pickupDate: -1, _id: -1 });
        const limit = parseCount(req.query.limit, 100) || MAX_PAGE_SIZE;
        const pickups = await wasteCollectionModel.find()
            .sort(sort)
            .skip(parseCount(req.query.skip, 0))
            .limit(Math.min(limit, MAX_PAGE_SIZE))
            .populate('user', CUSTOMER_FIELDS);
        return res.status(200).json(pickups);
    } catch (error) {
        next(error);
    }
};

// The operations team's calendar. `tzOffset` is what a browser reports from
// new Date().getTimezoneOffset(): minutes behind UTC, so UTC+2 is -120.
// Without it the server's own time zone is used.
const localCalendar = (rawOffset) => {
    const parsed = Number(rawOffset);
    const offset = rawOffset !== undefined && Number.isFinite(parsed) && Math.abs(parsed) <= 840
        ? Math.trunc(parsed)
        : new Date().getTimezoneOffset();
    const shift = offset * 60 * 1000;
    // The UTC fields of `local` read as wall-clock time in that zone.
    const local = new Date(Date.now() - shift);
    const year = local.getUTCFullYear();
    const month = local.getUTCMonth();
    const day = local.getUTCDate();
    const at = (y, m, d) => new Date(Date.UTC(y, m, d) + shift);
    const pad = (n) => String(n).padStart(2, '0');
    const minutes = Math.abs(offset);

    return {
        dayStart: at(year, month, day),
        dayEnd: at(year, month, day + 1),
        // The current month and the five before it.
        monthsStart: at(year, month - 5, 1),
        monthsEnd: at(year, month + 1, 1),
        months: Array.from({ length: 6 }, (_, i) => {
            const first = new Date(Date.UTC(year, month - 5 + i, 1));
            return `${first.getUTCFullYear()}-${pad(first.getUTCMonth() + 1)}`;
        }),
        timezone: `${offset <= 0 ? '+' : '-'}${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`,
    };
};

// Pickups completed before actual weights were recorded only have an estimate.
const COLLECTED_WEIGHT = {
    $cond: [{ $gt: ['$actualWeight', 0] }, '$actualWeight', { $ifNull: ['$estimatedWeight', 0] }],
};

const round = (value, places) => Number((value || 0).toFixed(places));

// Admin-only: everything the operations overview shows, in one request, so it
// never has to download the full pickup list.
export const getPickupSummary = async (req, res, next) => {
    try {
        const calendar = localCalendar(req.query.tzOffset);
        const dueScheduled = { status: 'Scheduled', pickupDate: { $lt: calendar.dayEnd } };
        const attentionQuery = (filter) => wasteCollectionModel.find(filter)
            .sort({ pickupDate: 1 })
            .limit(8)
            .populate('user', CUSTOMER_FIELDS);

        const [statusRows, today, typeRows, monthRows, roleRows, inProgress, due, dueCount] = await Promise.all([
            wasteCollectionModel.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
            wasteCollectionModel.countDocuments({
                status: { $ne: 'Cancelled' },
                pickupDate: { $gte: calendar.dayStart, $lt: calendar.dayEnd },
            }),
            wasteCollectionModel.aggregate([
                { $match: { status: 'Completed' } },
                {
                    $group: {
                        _id: '$wasteType',
                        pickups: { $sum: 1 },
                        weightKg: { $sum: COLLECTED_WEIGHT },
                        carbonKg: { $sum: '$carbonSaved' },
                    }
                },
                { $sort: { weightKg: -1 } },
            ]),
            wasteCollectionModel.aggregate([
                {
                    $match: {
                        status: { $ne: 'Cancelled' },
                        pickupDate: { $gte: calendar.monthsStart, $lt: calendar.monthsEnd },
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m', date: '$pickupDate', timezone: calendar.timezone } },
                        count: { $sum: 1 },
                    }
                },
            ]),
            UserModel.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
            attentionQuery({ status: 'In Progress' }),
            attentionQuery(dueScheduled),
            wasteCollectionModel.countDocuments(dueScheduled),
        ]);

        const countOf = (rows, key) => rows.find((row) => row._id === key)?.count || 0;
        const byStatus = Object.fromEntries(PICKUP_STATUSES.map((status) => [status, countOf(statusRows, status)]));

        res.json({
            generatedAt: new Date().toISOString(),
            pickups: {
                total: statusRows.reduce((sum, row) => sum + row.count, 0),
                byStatus,
                // Not cancelled, with a pickup date inside the current day.
                today,
                // In progress, plus scheduled pickups due today or earlier.
                needsAttention: byStatus['In Progress'] + dueCount,
            },
            impact: {
                weightKg: round(typeRows.reduce((sum, row) => sum + row.weightKg, 0), 1),
                // An estimate: see CARBON_KG_PER_KG.
                carbonKg: round(typeRows.reduce((sum, row) => sum + row.carbonKg, 0), 2),
            },
            users: {
                households: countOf(roleRows, 'user'),
                vendors: countOf(roleRows, 'vendor'),
                admins: countOf(roleRows, 'admin'),
            },
            monthly: calendar.months.map((month) => ({ month, count: countOf(monthRows, month) })),
            byWasteType: typeRows.map((row) => ({
                wasteType: row._id,
                pickups: row.pickups,
                weightKg: round(row.weightKg, 1),
            })),
            attention: [...inProgress, ...due].slice(0, 8),
        });
    } catch (error) {
        next(error);
    }
};

// What a household may change on its own pickup while it is still Scheduled.
const DETAIL_FIELDS = ['pickupDate', 'location', 'wasteType', 'estimatedWeight', 'notes'];

export const updatePickup = async (req, res, next) => {
    try {
        const schedule = isValidObjectId(req.params.id)
            ? await wasteCollectionModel.findById(req.params.id)
            : null;
        if (!schedule) return res.status(404).json({ message: 'Pickup not found' });

        const isOwner = schedule.user.toString() === req.auth.id;
        const isAdmin = req.auth.role === 'admin';
        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        // Status, points and completion are only ever set by the status
        // endpoint, so neither validator accepts them here.
        const validator = isAdmin ? updatePickupValidator : userUpdatePickupValidator;
        const { error, value } = validator.validate(req.body, { stripUnknown: true });
        if (error) return res.status(422).json({ message: error.details[0].message });

        if (!isAdmin) {
            const changesDetails = DETAIL_FIELDS.some((field) => value[field] !== undefined);
            if (changesDetails && schedule.status !== 'Scheduled') {
                return res.status(409).json({ message: 'Only a scheduled pickup can be edited.' });
            }
            const rates = value.rating !== undefined || value.feedback !== undefined;
            if (rates && schedule.status !== 'Completed') {
                return res.status(409).json({ message: 'A pickup can be rated once it is completed.' });
            }
        }

        await wasteCollectionModel.findByIdAndUpdate(req.params.id, value);
        res.json({ message: 'Pickup updated' });
    } catch (error) {
        next(error);
    }
};

// The household (or operations) calls off a pickup that has not started. It
// stays on record as Cancelled so the operations team can still see it.
export const cancelPickup = async (req, res, next) => {
    try {
        const pickup = isValidObjectId(req.params.id)
            ? await wasteCollectionModel.findById(req.params.id)
            : null;
        if (!pickup) return res.status(404).json({ message: 'Pickup not found' });
        if (req.auth.role !== 'admin' && pickup.user.toString() !== req.auth.id) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        if (pickup.status !== 'Scheduled') {
            const message = pickup.status === 'In Progress'
                ? 'Collection has already started, so this pickup can no longer be cancelled.'
                : CLOSED_MESSAGE[pickup.status];
            return res.status(409).json({ message });
        }

        const updated = await wasteCollectionModel.findOneAndUpdate(
            { _id: pickup._id, status: 'Scheduled' },
            { status: 'Cancelled' },
            { new: true }
        );
        if (!updated) {
            return res.status(409).json({ message: 'This pickup has just changed and can no longer be cancelled.' });
        }
        res.json({ message: 'Pickup cancelled', pickup: updated });
    } catch (error) {
        next(error);
    }
};

// Credits the household for a completed pickup: points, totals, level and
// badges, then tells them. Called once per pickup (see updatePickupStatus).
const awardCompletion = async (pickup) => {
    const { pointsEarned, carbonSaved, actualWeight: weightKg } = pickup;
    const userId = pickup.user?._id || pickup.user;

    const user = await UserModel.findByIdAndUpdate(
        userId,
        {
            $inc: {
                points: pointsEarned,
                wasteCollected: weightKg,
                carbonSaved,
                completedPickups: 1,
                totalPickups: 1,
            }
        },
        { new: true }
    );
    // The account was deleted after the pickup was booked.
    if (!user) return;

    const newBadges = [];
    if (user.completedPickups === 1 && !user.badges.includes('first_pickup'))
        newBadges.push('first_pickup');
    if (user.completedPickups >= 5 && !user.badges.includes('five_pickups'))
        newBadges.push('five_pickups');
    if (user.completedPickups >= 10 && !user.badges.includes('ten_pickups'))
        newBadges.push('ten_pickups');
    if (user.carbonSaved >= 50 && !user.badges.includes('carbon_saver'))
        newBadges.push('carbon_saver');

    const previous = await wasteCollectionModel
        .findOne({ user: userId, status: 'Completed', _id: { $ne: pickup.id } })
        .sort({ completedAt: -1 })
        .select('completedAt');

    const newLevel = getLevel(user.points);
    await UserModel.findByIdAndUpdate(userId, {
        level: newLevel,
        streak: nextStreak(user.streak, previous?.completedAt, pickup.completedAt),
        ...(newBadges.length > 0 ? { $push: { badges: { $each: newBadges } } } : {})
    });

    notify(userId, {
        type: 'points',
        title: pointsEarned > 0 ? `You earned ${pointsEarned} points` : 'Pickup completed',
        body: `Pickup completed: ${weightKg} kg collected, an estimated ${carbonSaved} kg CO2e avoided. Your level: ${newLevel}.`,
        link: '/customerDashboard/overview',
    });
    for (const badge of newBadges) {
        notify(userId, {
            type: 'badge',
            title: 'New badge unlocked',
            body: `You earned the "${badge.replace(/_/g, ' ')}" badge.`,
            link: '/customerDashboard/overview',
        });
    }
};

// Admin-only: move a pickup through its states.
//   body: { status, actualWeight?, agentName? }
// Completing a pickup awards the household's points, exactly once.
export const updatePickupStatus = async (req, res, next) => {
    try {
        const { error, value } = updatePickupStatusValidator.validate(req.body, { stripUnknown: true });
        if (error) return res.status(422).json({ message: error.details[0].message });
        const { status, actualWeight, agentName } = value;

        const pickup = isValidObjectId(req.params.id)
            ? await wasteCollectionModel.findById(req.params.id)
            : null;
        if (!pickup) return res.status(404).json({ message: 'Pickup not found' });
        if (CLOSED_STATUSES.includes(pickup.status)) {
            return res.status(409).json({ message: CLOSED_MESSAGE[pickup.status] });
        }

        const update = { status };
        if (agentName !== undefined) update.agentName = agentName;
        if (actualWeight !== undefined) update.actualWeight = actualWeight;

        if (status === 'Completed') {
            // The weight measured at collection wins; otherwise fall back to
            // what was recorded earlier, then to the household's estimate.
            const weightKg = actualWeight ?? (pickup.actualWeight || pickup.estimatedWeight || 0);
            update.actualWeight = weightKg;
            update.pointsEarned = Math.round(weightKg * POINTS_PER_KG);
            update.carbonSaved = parseFloat((weightKg * CARBON_KG_PER_KG).toFixed(2));
            update.completedAt = new Date();
        }

        // Only an open pickup matches, so when two requests race to close the
        // same pickup one of them finds nothing and no points are awarded twice.
        const updated = await wasteCollectionModel
            .findOneAndUpdate({ _id: pickup._id, status: { $nin: CLOSED_STATUSES } }, update, { new: true })
            .populate('user', CUSTOMER_FIELDS);
        if (!updated) {
            return res.status(409).json({ message: 'This pickup was just closed by someone else and can no longer be changed.' });
        }

        if (status === 'Completed') {
            await awardCompletion({ ...update, user: pickup.user, id: pickup._id });
        } else if (status !== pickup.status) {
            const collector = status === 'In Progress' && updated.agentName ? ` Collector: ${updated.agentName}.` : '';
            notify(pickup.user, {
                type: 'pickup',
                title: `Pickup ${status.toLowerCase()}`,
                body: `Your ${pickup.wasteType} pickup for ${formatPickupDate(pickup.pickupDate)} is now "${status}".${collector}`,
                link: `/customerDashboard/schedule/${pickup.id}`,
            });
        }

        res.json({ message: 'Pickup status updated', pickup: updated });
    } catch (error) {
        next(error);
    }
};

export const deleteSchedule = async (req, res, next) => {
    try {
        const schedule = await wasteCollectionModel.findById(req.params.id);
        if (!schedule) {
            return res.status(404).json({ message: 'Schedule not found' });
        }
        const isAdmin = req.auth.role === 'admin';
        if (!isAdmin && schedule.user.toString() !== req.auth.id) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        // In-progress and completed pickups are part of the operator's records.
        if (!isAdmin && !['Scheduled', 'Cancelled'].includes(schedule.status)) {
            return res.status(409).json({ message: 'A pickup that is in progress or completed cannot be deleted.' });
        }
        await wasteCollectionModel.findByIdAndDelete(req.params.id);
        res.json({ message: 'Schedule deleted successfully' });
    } catch (error) {
        next(error);
    }
};
