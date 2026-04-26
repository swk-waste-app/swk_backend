import { ProductModel } from '../models/products.js';
import { addProductValidator, updateProductValidator } from '../validators/products.js';

export const addProduct = async (req, res, next) => {
    try {
        const { error, value } = addProductValidator.validate({
            ...req.body,
            image: req.file?.filename,

        })
        if (error) {
            return res.status(422).json(error);
        }

        await ProductModel.create({
            ...value,
            user: req.auth.id
        });
        res.status(201).json('Product was added');

    } catch (error) {
        next(error);
    }
};

export const getProducts = async (req, res, next) => {
    try {
        const { title, category, minPrice, maxPrice, user, limit = 100, skip = 0, sort = "{}" } = req.query;
        let filter = {};

        if (title) {
            filter.title = { $regex: title, $options: 'i' };
        }
        if (category) {
            filter.category = category;
        }
        if (user) {
            filter.user = user;
        }
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }

        const products = await ProductModel
            .find(filter)
            .populate('user', 'name')
            .sort(JSON.parse(sort))
            .limit(Number(limit))
            .skip(Number(skip));

        res.status(200).json(products);
    } catch (error) {
        next(error);
    }
};

export const countProducts = async (req, res, next) => {
    try {
        const { filter = '{}' } = req.query;
        const count = await ProductModel.countDocuments(JSON.parse(filter));
        res.json({ count });
    } catch (error) {
        next(error);
    }
}

export const getProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = await ProductModel.findById(id).populate('user', 'name location');
        res.status(200).json(product);
    } catch (error) {
        next(error);
    }
}

export const updateProduct = async (req, res, next) => {
    try {
        const { error, value } = updateProductValidator.validate({
            ...req.body,
            image: req.file?.filename
        });
        if (error) {
            return res.status(422).json(error);
        }
        
        await ProductModel.findByIdAndUpdate(req.params.id, value);
        res.json('Product updated');
    } catch (error) {
        next(error);
    }
};


export const deleteProduct = async (req, res, next) => {
    try {
        const deletedProduct = await ProductModel.findByIdAndDelete(req.params.id);
        if (!deletedProduct) return res.status(404).json({ message: 'Product not found' });

        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        next(error);
    }
};
