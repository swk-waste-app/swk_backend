import { wasteCollectionModel} from "../models/wasteCollection.js";
import { UserModel } from "../models/user.js";
import { schedulePickupValidator, updatePickupValidator, userUpdatePickupValidator } from "../validators/wasteCollection.js";

const LEVELS = [
    { name: 'Beginner', min: 0 },
    { name: 'Recycler', min: 100 },
    { name: 'Eco Warrior', min: 500 },
    { name: 'Green Champion', min: 1000 },
    { name: 'Earth Guardian', min: 5000 },
];

const getLevel = (points) =>
    [...LEVELS].reverse().find(l => points >= l.min)?.name || 'Beginner';


export const schedulePickup = async (req, res, next) => {
    try {
        const { error, value } = schedulePickupValidator.validate(req.body);
        if (error) return res.status(422).json(error.details[0].message);

        await wasteCollectionModel.create({ ...value, user: req.auth.id });
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

// Admin-only: view every user's pickup history. Ownership is enforced by the
// 'view_all_pickups' permission on the route, not here.
export const getPickupHistory = async (req, res, next) => {
    try {
        const { sort = "{}", limit = 100, skip = 0 } = req.query;
        const pickups = await wasteCollectionModel.find()
        .sort(JSON.parse(sort))
        .limit(limit)
        .skip(skip)
       return res.status(200).json(pickups);
    } catch (error) {
        next(error);
    }
};

export const updatePickup = async (req, res, next) => {
    try {
        const schedule = await wasteCollectionModel.findById(req.params.id);
        if (!schedule) return res.status(404).json({ message: 'Schedule not found' });

        const isOwner = schedule.user.toString() === req.auth.id;
        const isAdmin = req.auth.role === 'admin';
        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        // Non-admins may only touch their own schedule details, never status
        // or the gamification fields those endpoints exist to protect.
        const validator = isAdmin ? updatePickupValidator : userUpdatePickupValidator;
        const { error, value } = validator.validate(req.body);
        if (error) {
            return res.status(422).json(error);
        }
        await wasteCollectionModel.findByIdAndUpdate(req.params.id, value);
        res.json('Schedule updated');
    } catch (error) {
        next(error);
    }
};

export const updatePickupStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const pickup = await wasteCollectionModel.findById(req.params.id);
        if (!pickup) return res.status(404).json({ message: 'Pickup not found' });

        const update = { status };

        if (status === 'Completed' && pickup.status !== 'Completed') {
            const weightKg = pickup.actualWeight || pickup.estimatedWeight || 0;
            const pointsEarned = Math.round(weightKg * 10);
            const carbonSaved = parseFloat((weightKg * 0.21).toFixed(2));

            update.pointsEarned = pointsEarned;
            update.carbonSaved = carbonSaved;
            update.completedAt = new Date();

            const user = await UserModel.findByIdAndUpdate(
                pickup.user,
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

            const newBadges = [];
            if (user.completedPickups === 1 && !user.badges.includes('first_pickup'))
                newBadges.push('first_pickup');
            if (user.completedPickups >= 5 && !user.badges.includes('five_pickups'))
                newBadges.push('five_pickups');
            if (user.completedPickups >= 10 && !user.badges.includes('ten_pickups'))
                newBadges.push('ten_pickups');
            if (user.carbonSaved >= 50 && !user.badges.includes('carbon_saver'))
                newBadges.push('carbon_saver');

            const newLevel = getLevel(user.points);
            await UserModel.findByIdAndUpdate(pickup.user, {
                level: newLevel,
                ...(newBadges.length > 0 ? { $push: { badges: { $each: newBadges } } } : {})
            });
        }

        await wasteCollectionModel.findByIdAndUpdate(req.params.id, update);
        res.json({ message: 'Pickup status updated' });
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
        if (req.auth.role !== 'admin' && schedule.user.toString() !== req.auth.id) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        await wasteCollectionModel.findByIdAndDelete(req.params.id);
        res.json({ message: 'Schedule deleted successfully' });
    } catch (error) {
        next(error);
    }
};
