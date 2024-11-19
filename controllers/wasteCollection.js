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

export const countSchedules = async (req, res, next) => {
    try {
        const { filter = '{}' } = req.body;
        //count adverts in database
        const count = await wasteCollectionModel.countDocuments(JSON.parse(filter));
        //Respond to request
        res.json({ count })
    } catch (error) {
        next(error);

    }
}

export const getSchedule = async (req, res, next) => {
    try {
        const { id } = req.params;
        //Get schedule by id from database
        const schedule = await wasteCollectionModel.findById(id);
        res.json(schedule);
    } catch (error) {
        next(error);

    }
}

export const getPickupHistory = async (req, res, next) => {
    try {
        const {filter = "{}", sort = "{}", limit = 100, skip = 0} = req.query;
        const pickups = await wasteCollectionModel.find(JSON.parse(filter))
        .sort(JSON.parse(sort))
        .limit(limit)
        .skip(skip)
       return res.status(200).json(pickups);
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

export const deleteSchedule = async (req, res, next) => {
    try {
        await wasteCollectionModel.findByIdAndDelete(req.params.id, { status: req.body.status });
        res.json({ message: 'schedule deleted successfully' });
    } catch (error) {
        next(error);
    }
};
