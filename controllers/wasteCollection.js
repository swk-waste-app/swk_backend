// import { WasteCollectionModel } from './models/wasteCollection.js';
// import { schedulePickupValidator } from './validators/wasteCollection.js';

// export const schedulePickup = async (req, res, next) => {
//     try {
//         const { error, value } = schedulePickupValidator.validate(req.body);
//         if (error) return res.status(422).json(error.details[0].message);

//         await WasteCollectionModel.create({ ...value, user: req.user.id });
//         res.status(201).json({ message: 'Pickup scheduled successfully' });
//     } catch (error) {
//         next(error);
//     }
// };

// export const getPickupHistory = async (req, res, next) => {
//     try {
//         const pickups = await WasteCollectionModel.find({ user: req.user.id });
//         res.json(pickups);
//     } catch (error) {
//         next(error);
//     }
// };

// export const updatePickupStatus = async (req, res, next) => {
//     try {
//         await WasteCollectionModel.findByIdAndUpdate(req.params.id, { status: req.body.status });
//         res.json({ message: 'Pickup status updated' });
//     } catch (error) {
//         next(error);
//     }
// };
