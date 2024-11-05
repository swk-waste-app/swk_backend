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
        // Extract query params
        const { title, category, minPrice, maxPrice, limit = 10, skip = 0, sort = "{}" } = req.query;
        let filter = {}; 

      
        if (title) {
            filter.title = { $regex: title, $options: 'i' }; // 'i' for case-insensitive
        }

        
        if (category) {
            filter.category = category;
        }

        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = minPrice; 
            if (maxPrice) filter.price.$lte = maxPrice; 
        }

        // Fetch adverts from the database based on filter, with pagination and sorting
        const products = await ProductModel
            .find(filter)
            .sort(JSON.parse(sort)) 
            .limit(Number(limit))   
            .skip(Number(skip));    

        // Respond with the list of adverts
        res.status(200).json(adverts);
    } catch (error) {
        next(error); // Pass any error to the error handler middleware
    }
};

export const countProducts = async (req, res, next) => {
    try {
        const { } = req.body;
        //count adverts in database
        const count = await ProductModel.countDocuments(JSON.parse(filter));
        //Respond to request
        res.json({ count })
    } catch (error) {
        next(error);

    }
}

export const getProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        //Get advert by id from database
        const advert = await ProductModel.findById(id);
        res.json(product);
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
        // Update the advert
        const advert = await ProductModel.findByIdAndUpdate(req.params.id, value);
        // Respond with success message
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
