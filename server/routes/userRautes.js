import express from 'express';
import userAuth from '../middleware/userAuth';
import { getUserData } from '../controllers/userController.js';

const UserRouter = express.Router();

userRoutaer.get('/data', userAuth, getUserData) 


export default UserRouter;
