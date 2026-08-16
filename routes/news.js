import { Router } from "express";
import { fetchNewsArticles } from "../controllers/news.js";


const newsRouter = Router();

// Mounted at /api/news in index.js, so this handles GET /api/news
newsRouter.get('/', fetchNewsArticles);

export default newsRouter;