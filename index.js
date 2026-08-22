// Must stay the very first import: ES modules evaluate every import before any
// code in this file runs, so a plain dotenv.config() call here would execute
// AFTER utils/passport.js and middlewares/auth.js have already read process.env.
import 'dotenv/config';
import express from 'express'
import mongoose from 'mongoose';
import cors from 'cors'
import passport from './utils/passport.js';
import { allowedOrigins } from './utils/allowedOrigins.js';

import productRouter from './routes/products.js';
import userRouter from './routes/user.js';
import newsRouter from './routes/news.js';
import googleScholarRouter from './routes/googleScholar.js';
import wasteCollectionRouter from './routes/wasteCollection.js';
import messageRouter from './routes/message.js';
import authRouter from './routes/auth.js';
import educationRouter from './routes/education.js';

// Connect to database
await mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Database connected successfully"))
    .catch((error) => console.log("Error connecting to database", error));

const app = express();
app.use(express.json());
app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

// Initialize passport
app.use(passport.initialize());

// API routes
app.use('/api/products', productRouter);
app.use('/api/users', userRouter);
app.use('/api/waste-collection', wasteCollectionRouter);
app.use('/api/news', newsRouter);
app.use('/api/scholar', googleScholarRouter);
app.use('/api/messages', messageRouter);
app.use('/api/auth', authRouter);
app.use('/api/education', educationRouter);

// Global error handler
app.use((err, req, res, next) => {
    console.error(err);
    const status = err.status || err.statusCode || 500;
    res.status(status).json({ message: err.message || 'Internal server error' });
});

const port = process.env.PORT || 6060;
app.listen(port, () => {
    console.log('App is listening on port ' + port);
});