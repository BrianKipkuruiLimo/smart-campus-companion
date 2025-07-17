import userModel from '../models/usermodel.js';

export const getUserData = async (req, res) => {

    try{
        const {userId} = req.user; // Get userId from req.user set by userAuth middleware
        const user = await userModel.findById(userId).select();

        if(!user){
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.status(200).json({
            success: true,
            userData: {
                name: user.name,
                email: user.email,
                isAccountVerified: user.isAccountVerified,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        }); 
    }catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}
