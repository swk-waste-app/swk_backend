import { EducationModel } from '../models/education.js';
import { addEducationValidator, updateEducationValidator } from '../validators/education.js';

export const addArticle = async (req, res, next) => {
    try {
        const { error, value } = addEducationValidator.validate({
            ...req.body,
            image: req.file?.filename,
        });
        if (error) return res.status(422).json({ message: error.details[0].message });

        await EducationModel.create({ ...value, author: req.auth.id });
        res.status(201).json({ message: 'Resource added successfully' });
    } catch (error) {
        next(error);
    }
};

export const getArticles = async (req, res, next) => {
    try {
        const { category, limit = 50, skip = 0 } = req.query;
        const filter = {};
        if (category) filter.category = category;

        const articles = await EducationModel
            .find(filter)
            .populate('author', 'name')
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip(Number(skip));
        res.json(articles);
    } catch (error) {
        next(error);
    }
};

export const getArticleById = async (req, res, next) => {
    try {
        const article = await EducationModel.findById(req.params.id).populate('author', 'name');
        if (!article) return res.status(404).json({ message: 'Resource not found' });
        res.json(article);
    } catch (error) {
        next(error);
    }
};

export const updateArticle = async (req, res, next) => {
    try {
        const { error, value } = updateEducationValidator.validate({
            ...req.body,
            image: req.file?.filename,
        });
        if (error) return res.status(422).json({ message: error.details[0].message });

        const updated = await EducationModel.findByIdAndUpdate(req.params.id, value, { new: true });
        if (!updated) return res.status(404).json({ message: 'Resource not found' });
        res.json({ message: 'Resource updated successfully' });
    } catch (error) {
        next(error);
    }
};

export const deleteArticle = async (req, res, next) => {
    try {
        const deleted = await EducationModel.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Resource not found' });
        res.json({ message: 'Resource deleted successfully' });
    } catch (error) {
        next(error);
    }
};
