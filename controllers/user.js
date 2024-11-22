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


        // Hash the password and create the user
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
        if (error) {
            return res.status(422).json(error);
        }
        const user = await UserModel.findOne({ email: value.email });
        if (!user) {
            return res.status(404).json('User does not exist!');
        }
        const correctPassword = bcrypt.compareSync(value.password, user.password);
        if (!correctPassword) {
            return res.status(401).json("Invalid Credentials");
        }
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_PRIVATE_KEY,
            { expiresIn: '24h' }
        );
        res.json({
            message: 'User logged in!',
            accessToken: token,
            role: user.role
        });
    } catch (error) {
        next(error);
    }
};


export const getAllProfiles = async (req, res, next) => {
    try {
        const { filter = "{}" } = req.query
        const users = await UserModel.find({ ...JSON.parse(filter) }).select('-password');
        res.json(users);
    } catch (error) {
        next(error);
    }
};

export const getProfile = async (req, res, next) => {
    try {
        const user = await UserModel
            .findById(req.auth.id)
            .select({ password: false });
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
        if (error) {
            return res.status(422).json(error);
        }
        await UserModel.findByIdAndUpdate(req.auth.id, value);
        res.json('User profile updated');
    } catch (error) {
        next(error);
    }
};


export const getUserProducts = async (req, res, next) => {
    try {
        const {filter = '{}', sort = '{}', limit = 100, skip = 0} = req.query
        const productss = await ProductModel
        .find({
            ...JSON.parse(filter),
            user: req.auth.id
        })
        .sort(JSON.parse(sort))
        .limit(limit)
        .skip(skip);

        res.json(products);
    }catch (error) {
        next(error);
    }

    }



export const getUserSchedules = async (req, res, next) => {
    try {
        const {filter = '{}', sort = '{}', limit = 100, skip = 0} = req.query
        const schedules = await wasteCollectionModel
        .find({
            ...JSON.parse(filter),
            user: req.auth.id
        })
        .sort(JSON.parse(sort))
        .limit(limit)
        .skip(skip);

        res.json(schedules);
    }catch (error) {
        next(error);
    }

    }
