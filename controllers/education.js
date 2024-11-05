// import { EducationModel } from './models/education.js';

// export const addArticle = async (req, res, next) => {
//     try {
//         const { title, contentType, content, tags } = req.body;
//         await EducationModel.create({
//             title,
//             contentType,
//             content,
//             tags,
//             author: req.user.id
//         });
//         res.status(201).json({ message: 'Article added successfully' });
//     } catch (error) {
//         next(error);
//     }
// };

// export const getArticles = async (req, res, next) => {
//     try {
//         const articles = await EducationModel.find();
//         res.json(articles);
//     } catch (error) {
//         next(error);
//     }
// };

// export const getArticleById = async (req, res, next) => {
//     try {
//         const article = await EducationModel.findById(req.params.id);
//         if (!article) return res.status(404).json({ message: 'Article not found' });
//         res.json(article);
//     } catch (error) {
//         next(error);
//     }
// };

// export const updateArticle = async (req, res, next) => {
//     try {
//         await EducationModel.findByIdAndUpdate(req.params.id, req.body);
//         res.json({ message: 'Article updated successfully' });
//     } catch (error) {
//         next(error);
//     }
// };

// export const deleteArticle = async (req, res, next) => {
//     try {
//         await EducationModel.findByIdAndDelete(req.params.id);
//         res.json({ message: 'Article deleted successfully' });
//     } catch (error) {
//         next(error);
//     }
// };
