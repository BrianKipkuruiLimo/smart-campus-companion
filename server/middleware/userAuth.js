import jwt from 'jsonwebtoken';

const userAuth = async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        return res.json({ success: false, message: "Please login first" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.userId) {
            req.user = { userId: decoded.userId }; // ✅ Use req.user instead of modifying req.body
            next();
        } else {
            return res.json({ success: false, message: "Invalid token structure" });
        }

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

export default userAuth;

