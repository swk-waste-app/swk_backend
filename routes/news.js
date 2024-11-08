import { Router } from "express";
import { fetchNewsArticles } from "../controllers/news.js";


const newsRouter = Router();

// Route to fetch news articles
newsRouter.get('/news', fetchNewsArticles);

export default newsRouter;