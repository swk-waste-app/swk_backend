import { wasteCollectionModel} from "../models/wasteCollection.js";
import { schedulePickupValidator } from "../validators/wasteCollection.js";


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

export const getPickupHistory = async (req, res, next) => {
    try {
        const pickups = await wasteCollectionModel.find({ user: req.user.id });
        res.json(pickups);
    } catch (error) {
        next(error);
    }
};

export const updatePickupStatus = async (req, res, next) => {
    try {
        await wasteCollectionModel.findByIdAndUpdate(req.params.id, { status: req.body.status });
        res.json({ message: 'Pickup status updated' });
    } catch (error) {
        next(error);
    }
};
