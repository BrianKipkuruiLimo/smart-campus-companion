import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import connectDB from './config/mongoDB.js';

import authRouter from './routes/authRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(express.json());
app.use(cookieParser());
app.use(cors({ credentials: true }));

//API Routes

app.get('/', (req, res) => res.send('Limo Brian API is running'));
app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)
  
app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});