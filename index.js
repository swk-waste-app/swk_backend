import express from 'express'
import mongoose from 'mongoose';
import cors from 'cors'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config();

import productRouter from './routes/products.js';
import userRouter from './routes/user.js';
import newsRouter from './routes/news.js';
import googleScholarRouter from './routes/googleScholar.js';
import wasteCollectionRouter from './routes/wasteCollection.js';
import messageRouter from './routes/message.js';

//connect to database
await mongoose.connect(process.env.MONGO_URI).then(() => console.log("Database connected successfully")).catch((error) => console.log("Error connecting to database", error))
//create an express app
const app = express();



app.use(express.json());
app.use(cors())

// API routes with consistent prefixes
app.use('/api/products', productRouter);
app.use('/api/users', userRouter);
app.use('/api/waste-collection', wasteCollectionRouter);
app.use('/api/news', newsRouter);
app.use('/api/scholar', googleScholarRouter);
app.use('/api/messages', messageRouter);

//listen for incoming requests
app.listen(6060, () => {
    console.log('App is listening on port 6060');
});
