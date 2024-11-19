import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/user.js';
import { registerUserValidator, loginUserValidator, updateProfileValidator } from '../validators/user.js';
import { ProductModel } from '../models/products.js';


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
        // Fetch all users from the database, excluding their passwords
        const users = await UserModel.find({ ...filter,
            user: req.user.id }).select('-password'); // '-password' excludes the password field
        res.json(users);
    } catch (error) {
        next(error); // Pass errors to the error-handling middleware
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
        // Extract query params
        const { title, category, minPrice, maxPrice, limit = 10, skip = 0, sort = "{}" } = req.query;
        let filter = {};

        // If title query param exists, perform a case-insensitive search on the title field
        if (title) {
            filter.title = { $regex: title, $options: 'i' }; // 'i' for case-insensitive
        }

        // If category query param exists, add it to the filter
        if (category) {
            filter.category = category;
        }

        // If minPrice or maxPrice query params exist, filter by price range
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = minPrice;
            if (maxPrice) filter.price.$lte = maxPrice;
        }

        // Fetch products from the database based on filter, with pagination and sorting
        const products = await ProductModel
            .find({
                ...filter,
                vendor: req.user.id,
            })
            .sort(JSON.parse(sort)) // Sort by the provided sort query
            .limit(Number(limit))   // Limit number of results
            .skip(Number(skip));    // Skip the first n results for pagination

        // Respond with the list of products
        res.status(200).json(products);
    } catch (error) {
        next(error);
    }
};
