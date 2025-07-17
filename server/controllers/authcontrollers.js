import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/usermodel.js';
import transporter from '../config/nodemailer.js';
import { response } from 'express';
// Register user
export const register = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new userModel({
            name,
            email,
            password: hashedPassword,
        });

        await user.save();

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        // Send welcome email
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Welcome to DuoJocker',
            text: `Hello ${name},\n\nThank you for registering with DuoJocker.`,
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({ message: "Registration successful" });

    } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({ message: error.message });
    }
};
// Login user
export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({ message: "Login successful" });

    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: error.message });
    }
};
// Logout user
export const logout = (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Strict',
        });

        return res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        console.error("Logout error:", error);
        return res.status(500).json({ message: error.message });
    }
};
// Send verification OTP to user's email
export const sendVerifyOtp = async (req, res) => {
    try {
        const { userId } = req.user; // ✅ Get from req.user

        const user = await userModel.findById(userId);

        if (user.isAccountVerified) {
            return res.json({ success: false, message: "Account already verified" });
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));

        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
        await user.save();

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Account verification OTP',
            text: `Your OTP is ${otp}. Please verify your account using the OTP.`,
        };

        await transporter.sendMail(mailOptions);

        return res.json({ success: true, message: "Verify OTP sent successfully" });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};
// Verify user account using OTP
export const verifyEmail = async (req, res) => {
    const { otp } = req.body;
    const { userId } = req.user; // ✅ Correct place to get userId

    if (!userId || !otp) {
        return res.json({ success: false, message: "All fields are required" });
    }

    try {
        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        if (!user.verifyOtp || user.verifyOtp !== otp) {
            return res.json({ success: false, message: "Invalid OTP" });
        }

        if (user.verifyOtpExpireAt < Date.now()) {
            return res.json({ success: false, message: "OTP has expired" });
        }

        user.isAccountVerified = true;
        user.verifyOtp = '';
        user.verifyOtpExpireAt = 0;
        await user.save();

        return res.json({ success: true, message: "Account verified successfully" });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};
// Check if user is authenticated
export const isAuthenticated = (req, res) => {
    try {
        return res.json({
            success: true,
            userId: req.user.userId // Optional: include info
        });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};
// send reset password OTP
export const sendResetOtp = async (req, res) => {
    const {email} = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }
    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));

        user.resetOtp = otp;
        user.resetOtpExpireAt = Date.now() + 15 * 60 * 60 * 1000;
        await user.save();

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Password Reset OTP',
            text: `Your OTP for reseting the password is ${otp}. Please proceed with reseting the password  using this OTP.`,
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({ message: "Reset OTP sent successfully" });    

}catch (error) {
        console.error("Error in sendResetOtp:", error);
        return res.status(500).json({ message: error.message });
    }
}
// reset user password 
export const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    try {
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (user.resetOtp !== otp) {
            return res.status(400).json({ success: false, message: "Invalid OTP" });
        }

        if (user.resetOtpExpireAt < Date.now()) {
            return res.status(400).json({ success: false, message: "OTP has expired" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        user.resetOtp = '';
        user.resetOtpExpireAt = 0;

        await user.save();

        return res.status(200).json({ success: true, message: "Password reset successfully" });

    } catch (error) {
        console.error("Error in resetPassword:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};


