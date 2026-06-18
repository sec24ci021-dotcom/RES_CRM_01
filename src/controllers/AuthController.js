const AuthService = require('../services/AuthService');
const { sendSuccess, sendCreated, sendError } = require('../utils/responseHandler');

class AuthController {
    static async register(req, res) {
        try {
            const payload = req.body;
            const user = await AuthService.register(payload);
            return sendCreated(res, user, 'User registered successfully');
        } catch (err) {
            return sendError(res, err.message || 'Registration failed', err.status || 500);
        }
    }

    static async login(req, res) {
        try {
            const { email, password } = req.body;
            const result = await AuthService.login({ email, password });
            return sendSuccess(res, result, 'Login successful');
        } catch (err) {
            return sendError(res, err.message || 'Login failed', err.status || 500);
        }
    }

    static async me(req, res) {
        try {
            const user = req.user || null;
            return sendSuccess(res, user, 'Current user');
        } catch (err) {
            return sendError(res, err.message || 'Failed to get user', err.status || 500);
        }
    }

    static async refresh(req, res) {
        try {
            const { refreshToken } = req.body;
            const tokens = await AuthService.refreshToken(refreshToken);
            return sendSuccess(res, tokens, 'Token refreshed');
        } catch (err) {
            return sendError(res, err.message || 'Refresh failed', err.status || 500);
        }
    }
}

module.exports = AuthController;