/**
 * Base Repository
 * Abstract repository with common CRUD operations
 */

class BaseRepository {
    constructor(model) {
        this.model = model;
    }

    /**
     * Find all documents
     */
    async findAll(filter = {}, options = {}) {
        const { skip = 0, limit = 10, sort = { createdAt: -1 }, populate = null } = options;

        let query = this.model.find(filter).skip(skip).limit(limit).sort(sort);

        if (populate) {
            if (Array.isArray(populate)) {
                populate.forEach(p => {
                    query = query.populate(p);
                });
            } else {
                query = query.populate(populate);
            }
        }

        return await query.exec();
    }

    /**
     * Find document by ID
     */
    async findById(id, options = {}) {
        const { populate = null } = options;

        let query = this.model.findById(id);

        if (populate) {
            if (Array.isArray(populate)) {
                populate.forEach(p => {
                    query = query.populate(p);
                });
            } else {
                query = query.populate(populate);
            }
        }

        return await query.exec();
    }

    /**
     * Find single document by criteria
     */
    async findOne(filter = {}, options = {}) {
        const { populate = null, sort = null } = options;

        let query = this.model.findOne(filter);

        if (sort) {
            query = query.sort(sort);
        }

        if (populate) {
            if (Array.isArray(populate)) {
                populate.forEach(p => {
                    query = query.populate(p);
                });
            } else {
                query = query.populate(populate);
            }
        }

        return await query.exec();
    }

    /**
     * Count documents
     */
    async count(filter = {}) {
        return await this.model.countDocuments(filter);
    }

    /**
     * Create new document
     */
    async create(data) {
        const document = new this.model(data);
        return await document.save();
    }

    /**
     * Create multiple documents
     */
    async createMany(documents) {
        return await this.model.insertMany(documents);
    }

    /**
     * Update document by ID
     */
    async updateById(id, data) {
        return await this.model.findByIdAndUpdate(
            id, { $set: data }, { new: true, runValidators: true }
        );
    }

    /**
     * Update multiple documents
     */
    async updateMany(filter, data) {
        return await this.model.updateMany(
            filter, { $set: data }, { new: true, runValidators: true }
        );
    }

    /**
     * Delete document by ID
     */
    async deleteById(id) {
        return await this.model.findByIdAndDelete(id);
    }

    /**
     * Delete multiple documents
     */
    async deleteMany(filter) {
        return await this.model.deleteMany(filter);
    }

    /**
     * Soft delete (mark as deleted)
     */
    async softDelete(id) {
        return await this.updateById(id, { isDeleted: true, deletedAt: new Date() });
    }

    /**
     * Restore soft deleted document
     */
    async restore(id) {
        return await this.updateById(id, { isDeleted: false, deletedAt: null });
    }

    /**
     * Aggregate documents
     */
    async aggregate(pipeline) {
        return await this.model.aggregate(pipeline);
    }

    /**
     * Get paginated results
     */
    async paginate(filter = {}, options = {}) {
        const { page = 1, limit = 10, sort = { createdAt: -1 }, populate = null } = options;
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            this.findAll(filter, { skip, limit, sort, populate }),
            this.count(filter)
        ]);

        return {
            data,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Check if document exists
     */
    async exists(filter = {}) {
        const count = await this.count(filter);
        return count > 0;
    }
}

module.exports = BaseRepository;
