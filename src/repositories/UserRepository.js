const User = require('../models/User');

class UserRepository {
    static async create(userData) {
        const user = new User(userData);
        return user.save();
    }

    static async findByEmail(email) {
        return User.findOne({ email: email.toLowerCase().trim() }).lean();
    }

    static async findById(id) {
        return User.findById(id).lean();
    }

    static async list(filter = {}, options = {}) {
        const query = User.find(filter).select('-password');
        if (options.limit) query.limit(options.limit);
        if (options.skip) query.skip(options.skip);
        return query.lean();
    }
}

module.exports = UserRepository;