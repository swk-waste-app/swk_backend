import { Router } from 'express';
import { addArticle, getArticles, getArticleById, updateArticle, deleteArticle } from '../controllers/education.js';
import { isAuthenticated, hasPermission } from '../middlewares/auth.js';
import { educationImageUpload } from '../middlewares/uploads.js';

const educationRouter = Router();

educationRouter.get('/', getArticles);
educationRouter.get('/:id', getArticleById);
educationRouter.post('/', isAuthenticated, hasPermission('manage_education'), educationImageUpload.single('image'), addArticle);
educationRouter.patch('/:id', isAuthenticated, hasPermission('manage_education'), educationImageUpload.single('image'), updateArticle);
educationRouter.delete('/:id', isAuthenticated, hasPermission('manage_education'), deleteArticle);

export default educationRouter;
