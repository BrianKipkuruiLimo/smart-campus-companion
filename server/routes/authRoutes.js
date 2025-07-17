import express from 'express';
import userAuth from '../middleware/userAuth.js';

import {
    register,
    login,
    logout,
    sendVerifyOtp,
    verifyEmail,
   isAuthenticated,
   sendResetOtp,
   resetPassword,

} from '../controllers/authcontrollers.js';

const authRouter = express.Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.post('/send-verify-otp', userAuth, sendVerifyOtp);
authRouter.post('/verify-account', userAuth, verifyEmail);
authRouter.get('/is-authenticated', userAuth, isAuthenticated);
authRouter.post('/send-reset-otp', sendResetOtp);
authRouter.post('/reset-password', resetPassword);
export default authRouter;
