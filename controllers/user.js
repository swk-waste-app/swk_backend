import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/user.js';
import { registerUserValidator, loginUserValidator, updateProfileValidator } from '../validators/user.js';
import { ProductModel } from '../models/products.js';
import { wasteCollectionModel } from '../models/wasteCollection.js';

export const registerUser = async (req, res, next) => {
    try {
        const { error, value } = registerUserValidator.validate(req.body);
        if (error) return res.status(422).json({ message: error.details[0].message });
        const existingUser = await UserModel.findOne({ email: value.email });
        if (existingUser) return res.status(409).json({ message: 'User already exists' });
        value.password = bcrypt.hashSync(value.password, 10);
        await UserModel.create(value);
        res.status(201).json({ message: 'User registered successfully!' });
    } catch (error) {
        next(error);
    }
};

export const loginUser = async (req, res, next) => {
    try {
        const { error, value } = loginUserValidator.validate(req.body);
        if (error) return res.status(422).json(error);
        const user = await UserModel.findOne({ email: value.email });
        if (!user) return res.status(404).json('User does not exist!');
        const correctPassword = bcrypt.compareSync(value.password, user.password);
        if (!correctPassword) return res.status(401).json("Invalid Credentials");
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_PRIVATE_KEY,
            { expiresIn: '24h' }
        );
        res.json({ message: 'User logged in!', accessToken: token, role: user.role });
    } catch (error) {
        next(error);
    }
};

export const getAllProfiles = async (req, res, next) => {
    try {
        const { filter = "{}" } = req.query;
        const users = await UserModel.find({ ...JSON.parse(filter) }).select('-password');
        res.json(users);
    } catch (error) {
        next(error);
    }
};

export const getProfile = async (req, res, next) => {
    try {
        const user = await UserModel.findById(req.auth.id).select({ password: false });
        res.json(user);
    } catch (error) {
        next(error);
    }
};

export const updateProfile = async (req, res, next) => {
    try {
        const { error, value } = updateProfileValidator.validate({
            ...req.body,
            avatar: req.file?.filename
        });
        if (error) return res.status(422).json(error);
        await UserModel.findByIdAndUpdate(req.auth.id, value);
        res.json('User profile updated');
    } catch (error) {
        next(error);
    }
};

export const getUserProducts = async (req, res, next) => {
    try {
        const { filter = '{}', sort = '{}', limit = 100, skip = 0 } = req.query;
        const products = await ProductModel
            .find({ ...JSON.parse(filter), user: req.auth.id })
            .sort(JSON.parse(sort))
            .limit(limit)
            .skip(skip);
        res.json(products);
    } catch (error) {
        next(error);
    }
};

export const getUserSchedules = async (req, res, next) => {
    try {
        const { filter = '{}', sort = '{}', limit = 100, skip = 0 } = req.query;
        const schedules = await wasteCollectionModel
            .find({ ...JSON.parse(filter), user: req.auth.id })
            .sort(JSON.parse(sort))
            .limit(limit)
            .skip(skip);
        res.json(schedules);
    } catch (error) {
        next(error);
    }
};

export const getUserStats = async (req, res, next) => {
    try {
        const userId = req.auth.id;
        const user = await UserModel.findById(userId).select('-password');
        const totalPickups = await wasteCollectionModel.countDocuments({ user: userId });
        const completedPickups = await wasteCollectionModel.countDocuments({ user: userId, status: 'Completed' });
        const scheduledPickups = await wasteCollectionModel.countDocuments({ user: userId, status: 'Scheduled' });
        const inProgressPickups = await wasteCollectionModel.countDocuments({ user: userId, status: 'In Progress' });
        const cancelledPickups = await wasteCollectionModel.countDocuments({ user: userId, status: 'Cancelled' });
        const wasteStats = await wasteCollectionModel.aggregate([
            { $match: { user: userId, status: 'Completed' } },
            {
                $group: {
                    _id: null,
                    totalWaste: { $sum: '$actualWeight' },
                    totalCarbon: { $sum: '$carbonSaved' },
                    totalPoints: { $sum: '$pointsEarned' }
                }
            }
        ]);
        const recentPickups = await wasteCollectionModel
            .find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(5);
        const monthlyPickups = await wasteCollectionModel.aggregate([
            { $match: { user: userId } },
            {
                $group: {
                    _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
            { $limit: 6 }
        ]);
        let vendorStats = null;
        if (user.role === 'vendor') {
            const totalProducts = await ProductModel.countDocuments({ user: userId });
            const productStats = await ProductModel.aggregate([
                { $match: { user: userId } },
                {
                    $group: {
                        _id: null,
                        totalViews: { $sum: '$views' },
                        totalSold: { $sum: '$sold' },
                        totalRevenue: { $sum: { $multiply: ['$price', '$sold'] } }
                    }
                }
            ]);
            vendorStats = {
                totalProducts,
                totalViews: productStats[0]?.totalViews || 0,
                totalSold: productStats[0]?.totalSold || 0,
                totalRevenue: productStats[0]?.totalRevenue || 0
            };
        }
        res.json({
            user,
            stats: {
                totalPickups,
                completedPickups,
                scheduledPickups,
                inProgressPickups,
                cancelledPickups,
                totalWasteCollected: wasteStats[0]?.totalWaste || 0,
                totalCarbonSaved: wasteStats[0]?.totalCarbon || 0,
                totalPoints: wasteStats[0]?.totalPoints || user.points || 0,
                level: user.level,
                badges: user.badges,
                streak: user.streak,
            },
            recentPickups,
            monthlyPickups,
            vendorStats
        });
    } catch (error) {
        next(error);
    }
};
export const getLeaderboard = async (req, res, next) => {
    try {
        const leaderboard = await UserModel
            .find({ role: 'user' })
            .select('name points level badges wasteCollected carbonSaved')
            .sort({ points: -1 })
            .limit(10);

        res.json(leaderboard);
    } catch (error) {
        next(error);
    }
};