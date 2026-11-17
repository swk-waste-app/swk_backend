import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import { UserModel } from '../models/user.js';
import { registerUserValidator, loginUserValidator, updateProfileValidator } from '../validators/user.js';
import { ProductModel } from '../models/products.js';
import { wasteCollectionModel } from '../models/wasteCollection.js';
import { parseSort, parseCount } from '../utils/query.js';
import { currentStreak } from '../utils/streak.js';

export const createAdmin = async (req, res, next) => {
    try {
        const secret = req.headers['x-admin-secret'];
        if (!secret || secret !== process.env.ADMIN_SECRET) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(422).json({ message: 'name, email, and password are required' });
        }
        if (password.length < 6) {
            return res.status(422).json({ message: 'Password must be at least 6 characters' });
        }
        const existing = await UserModel.findOne({ email });
        if (existing) return res.status(409).json({ message: 'Email already in use' });
        const hashed = bcrypt.hashSync(password, 10);
        await UserModel.create({ name, email, password: hashed, role: 'admin' });
        res.status(201).json({ message: 'Admin account created successfully' });
    } catch (error) {
        next(error);
    }
};

export const registerUser = async (req, res, next) => {
    try {
        const { error, value } = registerUserValidator.validate(req.body);
        if (error) return res.status(422).json({ message: error.details[0].message });
        const existingUser = await UserModel.findOne({ email: value.email });
        if (existingUser) return res.status(409).json({ message: 'User already exists' });
        value.password = bcrypt.hashSync(value.password, 10);
        await UserModel.create(value);
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        next(error);
    }
};

export const loginUser = async (req, res, next) => {
    try {
        const { error, value } = loginUserValidator.validate(req.body);
        if (error) return res.status(422).json({ message: error.details[0].message });
        const user = await UserModel.findOne({ email: value.email });
        const correctPassword = user ? bcrypt.compareSync(value.password, user.password) : false;
        if (!correctPassword) return res.status(401).json({ message: 'That email and password do not match an account.' });
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_PRIVATE_KEY,
            { expiresIn: '24h' }
        );
        res.json({ message: 'User logged in', accessToken: token, role: user.role });
    } catch (error) {
        next(error);
    }
};

export const getAllProfiles = async (req, res, next) => {
    try {
        const { role } = req.query;
        const filter = {};
        if (role) filter.role = role;
        const users = await UserModel.find(filter).select('-password');
        res.json(users);
    } catch (error) {
        next(error);
    }
};

export const getProfile = async (req, res, next) => {
    try {
        const user = await UserModel.findById(req.auth.id).select({ password: false });
        if (!user) return res.status(404).json({ message: 'User not found' });
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
        const { sort, limit, skip } = req.query;
        const products = await ProductModel
            .find({ user: req.auth.id })
            .sort(parseSort(sort))
            .limit(parseCount(limit, 100))
            .skip(parseCount(skip, 0));
        res.json(products);
    } catch (error) {
        next(error);
    }
};

export const getUserSchedules = async (req, res, next) => {
    try {
        const { sort, limit, skip } = req.query;
        const schedules = await wasteCollectionModel
            .find({ user: req.auth.id })
            .sort(parseSort(sort))
            .limit(parseCount(limit, 100))
            .skip(parseCount(skip, 0));
        res.json(schedules);
    } catch (error) {
        next(error);
    }
};

export const getUserStats = async (req, res, next) => {
    try {
        const userId = req.auth.id;
        const userObjectId = new Types.ObjectId(userId);
        const user = await UserModel.findById(userId).select('-password');
        const totalPickups = await wasteCollectionModel.countDocuments({ user: userObjectId });
        const completedPickups = await wasteCollectionModel.countDocuments({ user: userObjectId, status: 'Completed' });
        const scheduledPickups = await wasteCollectionModel.countDocuments({ user: userObjectId, status: 'Scheduled' });
        const inProgressPickups = await wasteCollectionModel.countDocuments({ user: userObjectId, status: 'In Progress' });
        const cancelledPickups = await wasteCollectionModel.countDocuments({ user: userObjectId, status: 'Cancelled' });
        const wasteStats = await wasteCollectionModel.aggregate([
            { $match: { user: userObjectId, status: 'Completed' } },
            {
                $group: {
                    _id: null,
                    // Pickups completed before actual weights were recorded only have an estimate.
                    totalWaste: {
                        $sum: { $cond: [{ $gt: ['$actualWeight', 0] }, '$actualWeight', { $ifNull: ['$estimatedWeight', 0] }] }
                    },
                    totalCarbon: { $sum: '$carbonSaved' },
                    totalPoints: { $sum: '$pointsEarned' }
                }
            }
        ]);
        const recentPickups = await wasteCollectionModel
            .find({ user: userObjectId })
            .sort({ createdAt: -1 })
            .limit(5);
        const monthlyPickups = await wasteCollectionModel.aggregate([
            { $match: { user: userObjectId } },
            {
                $group: {
                    _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': -1, '_id.month': -1 } },
            { $limit: 6 },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);
        const lastCompleted = await wasteCollectionModel
            .findOne({ user: userObjectId, status: 'Completed' })
            .sort({ completedAt: -1 })
            .select('completedAt');
        let vendorStats = null;
        if (user.role === 'vendor') {
            const totalProducts = await ProductModel.countDocuments({ user: userObjectId });
            const productStats = await ProductModel.aggregate([
                { $match: { user: userObjectId } },
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
                // Lapses once a full week passes with no completed pickup.
                streak: currentStreak(user.streak, lastCompleted?.completedAt),
            },
            recentPickups,
            monthlyPickups,
            vendorStats
        });
    } catch (error) {
        next(error);
    }
};
export const getPublicVendorProfile = async (req, res, next) => {
    try {
        const vendor = await UserModel.findById(req.params.id).select('name role location');
        if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
        const userObjectId = new Types.ObjectId(req.params.id);
        const totalProducts = await ProductModel.countDocuments({ user: userObjectId });
        const soldStats = await ProductModel.aggregate([
            { $match: { user: userObjectId } },
            { $group: { _id: null, totalSold: { $sum: '$sold' } } }
        ]);
        res.json({
            id: vendor.id,
            name: vendor.name,
            role: vendor.role,
            location: vendor.location,
            totalProducts,
            totalSold: soldStats[0]?.totalSold || 0,
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