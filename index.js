import express from 'express'
import mongoose from 'mongoose';
import cors from 'cors'
import productRouter from './routes/products.js';
import userRouter from './routes/user.js';
import newsRouter from './routes/news.js';
import googleScholarRouter from './routes/googleScholar.js';


//connect to database
await mongoose.connect(process.env.MONGO_URI)
//create an express app
const app = express();



app.use(express.json());

app.use(cors())
app.use(productRouter);
app.use(userRouter);
app.use('/api/news', newsRouter);
app.use('/api/scholar', googleScholarRouter);

//listen for incoming requests
app.listen(6060, () => {
    console.log('App is listening on port 6060');
});
