const UserRepository = require('../repositories/UserRepository');
const User = require('../models/User');
const { generateToken, generateRefreshToken } = require('../middleware/authMiddleware');
const config = require('../config/environment');
const { sendError } = require('../utils/responseHandler');

class AuthService {
    static async register({ name, email, password, role = 'Employee' }) {
        const existing = await UserRepository.findByEmail(email);
        if (existing) {
            const err = new Error('Email already registered');
            err.status = 422;
            throw err;
        }

        const user = await UserRepository.create({ name, email, password, role });
        const userObj = user.toObject ? user.toObject() : user;
        delete userObj.password;
        return userObj;
    }

    static async login({ email, password }) {
        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            const err = new Error('Invalid credentials');
            err.status = 401;
            throw err;
        }

        const match = await user.comparePassword(password);
        if (!match) {
            const err = new Error('Invalid credentials');
            err.status = 401;
            throw err;
        }

        const payload = { userId: user._id.toString(), role: user.role, email: user.email };
        const token = generateToken(payload, config.jwt.expiresIn);
        const refreshToken = generateRefreshToken(payload);

        return {
            user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role },
            token,
            refreshToken
        };
    }

    static async refreshToken(refreshToken) {
        // simple implementation using auth middleware verifyToken
        const { verifyToken } = require('../middleware/authMiddleware');
        const decoded = verifyToken(refreshToken);
        if (!decoded) {
            const err = new Error('Invalid refresh token');
            err.status = 401;
            throw err;
        }

        const payload = { userId: decoded.userId, role: decoded.role, email: decoded.email };
        const token = generateToken(payload, config.jwt.expiresIn);
        return { token };
    }
}

module.exports = AuthService;