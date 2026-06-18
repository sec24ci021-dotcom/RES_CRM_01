/**
 * Duplicate Check Service
 * Prevents duplicate lead creation
 * Follows Single Responsibility Principle
 */

const leadRepository = require('../repositories/LeadRepository');
const { DuplicateException } = require('../exceptions');
const logger = require('../utils/logger');

class DuplicateCheckService {
    /**
     * Check if lead with same email already exists
     * @param {string} email - Email address
     * @param {string} excludeLeadId - Lead ID to exclude (optional, for updates)
     * @returns {Promise<Object|null>} Existing lead or null
     */
    static async checkDuplicateEmail(email, excludeLeadId = null) {
        try {
            logger.info('Checking for duplicate email:', { email });

            const existingLead = await leadRepository.findOne({
                email: email.toLowerCase(),
                isDeleted: false
            });

            if (existingLead) {
                // If excluding a specific lead (update scenario), allow if it's the same lead
                if (excludeLeadId && existingLead._id.toString() === excludeLeadId.toString()) {
                    logger.info('Same lead, allowing email update');
                    return null;
                }

                logger.warn('Duplicate email found:', { email, leadId: existingLead._id });
                return existingLead;
            }

            return null;
        } catch (error) {
            logger.error('Error checking duplicate email:', error);
            throw error;
        }
    }

    /**
     * Check if lead with same phone already exists
     * @param {string} phone - Phone number
     * @param {string} excludeLeadId - Lead ID to exclude (optional)
     * @returns {Promise<Object|null>} Existing lead or null
     */
    static async checkDuplicatePhone(phone, excludeLeadId = null) {
        try {
            logger.info('Checking for duplicate phone:', { phone });

            const existingLead = await leadRepository.findOne({
                phone: phone,
                isDeleted: false
            });

            if (existingLead) {
                if (excludeLeadId && existingLead._id.toString() === excludeLeadId.toString()) {
                    logger.info('Same lead, allowing phone update');
                    return null;
                }

                logger.warn('Duplicate phone found:', { phone, leadId: existingLead._id });
                return existingLead;
            }

            return null;
        } catch (error) {
            logger.error('Error checking duplicate phone:', error);
            throw error;
        }
    }

    /**
     * Check for duplicate based on email or phone
     * @param {string} email - Email address
     * @param {string} phone - Phone number
     * @param {string} excludeLeadId - Lead ID to exclude (optional)
     * @returns {Promise<Object|null>} Existing lead or null
     * @throws {DuplicateException} If duplicate found
     */
    static async checkForDuplicate(email, phone, excludeLeadId = null) {
        try {
            logger.info('Checking for duplicate lead', { email, phone });

            // Check email duplicate
            const emailDuplicate = await this.checkDuplicateEmail(email, excludeLeadId);
            if (emailDuplicate) {
                logger.warn('Duplicate lead found by email', { leadId: emailDuplicate._id });
                throw new DuplicateException(
                    `Lead with email ${email} already exists`, {
                        _id: emailDuplicate._id,
                        firstName: emailDuplicate.firstName,
                        lastName: emailDuplicate.lastName,
                        email: emailDuplicate.email,
                        phone: emailDuplicate.phone,
                        source: emailDuplicate.source,
                        status: emailDuplicate.status
                    }
                );
            }

            // Check phone duplicate
            const phoneDuplicate = await this.checkDuplicatePhone(phone, excludeLeadId);
            if (phoneDuplicate) {
                logger.warn('Duplicate lead found by phone', { leadId: phoneDuplicate._id });
                throw new DuplicateException(
                    `Lead with phone ${phone} already exists`, {
                        _id: phoneDuplicate._id,
                        firstName: phoneDuplicate.firstName,
                        lastName: phoneDuplicate.lastName,
                        email: phoneDuplicate.email,
                        phone: phoneDuplicate.phone,
                        source: phoneDuplicate.source,
                        status: phoneDuplicate.status
                    }
                );
            }

            logger.info('No duplicates found');
            return null;
        } catch (error) {
            logger.error('Error checking for duplicates:', error);
            throw error;
        }
    }

    /**
     * Check for near duplicates (similar names, same city)
     * Useful for data quality and merging alerts
     * @param {string} firstName - First name
     * @param {string} lastName - Last name
     * @param {string} city - City
     * @returns {Promise<Array>} Array of potential duplicates
     */
    static async checkForNearDuplicates(firstName, lastName, city) {
        try {
            logger.info('Checking for near duplicates', { firstName, lastName, city });

            // Search for leads with similar names in same city
            const potentialDuplicates = await leadRepository.model.find({
                'location.city': city,
                isDeleted: false,
                $or: [{
                        firstName: { $regex: `^${firstName}`, $options: 'i' },
                        lastName: { $regex: `^${lastName}`, $options: 'i' }
                    },
                    {
                        firstName: { $regex: `^${lastName}`, $options: 'i' },
                        lastName: { $regex: `^${firstName}`, $options: 'i' }
                    }
                ]
            }).lean();

            if (potentialDuplicates.length > 0) {
                logger.warn('Potential duplicates found', { count: potentialDuplicates.length });
            }

            return potentialDuplicates;
        } catch (error) {
            logger.error('Error checking for near duplicates:', error);
            return [];
        }
    }

    /**
     * Check if duplicate exists in same source
     * Prevents multiple conversions from same source
     * @param {string} email - Email address
     * @param {string} source - Lead source
     * @returns {Promise<Object|null>} Existing lead or null
     */
    static async checkDuplicateInSource(email, source) {
        try {
            logger.info('Checking for duplicate in source', { email, source });

            const existingLead = await leadRepository.findOne({
                email: email.toLowerCase(),
                source: source,
                isDeleted: false
            });

            if (existingLead) {
                logger.warn('Duplicate in source found', { email, source, leadId: existingLead._id });
                return existingLead;
            }

            return null;
        } catch (error) {
            logger.error('Error checking duplicate in source:', error);
            throw error;
        }
    }

    /**
     * Merge duplicate leads
     * Consolidates data from duplicate leads
     * @param {string} primaryLeadId - ID of lead to keep
     * @param {string} duplicateLeadId - ID of lead to merge
     * @param {Object} mergeStrategy - How to merge data
     * @returns {Promise<Object>} Merged lead
     */
    static async mergeDuplicateLeads(primaryLeadId, duplicateLeadId, mergeStrategy = {}) {
        try {
            logger.info('Merging duplicate leads', { primaryLeadId, duplicateLeadId });

            const primaryLead = await leadRepository.getLeadById(primaryLeadId);
            const duplicateLead = await leadRepository.getLeadById(duplicateLeadId);

            if (!primaryLead || !duplicateLead) {
                throw new Error('One or both leads not found');
            }

            // Merge data based on strategy
            const mergedData = {
                ...primaryLead,
                activities: [
                    ...(primaryLead.activities || []),
                    ...(duplicateLead.activities || [])
                ],
                source: mergeStrategy.source || primaryLead.source,
                notes: mergeStrategy.notes || `${primaryLead.notes || ''}\n[Merged from duplicate: ${duplicateLeadId}]\n${duplicateLead.notes || ''}`
            };

            // Update primary lead
            const updated = await leadRepository.updateLead(
                primaryLeadId,
                mergedData,
                'system'
            );

            // Soft delete duplicate lead
            await leadRepository.deleteLead(duplicateLeadId, 'system');

            logger.info('Duplicate leads merged successfully');
            return updated;
        } catch (error) {
            logger.error('Error merging duplicate leads:', error);
            throw error;
        }
    }

    /**
     * Find and flag potential duplicates
     * @returns {Promise<Array>} Array of potential duplicate groups
     */
    static async findPotentialDuplicates() {
        try {
            logger.info('Finding potential duplicates');

            // Aggregation pipeline to find duplicates
            const duplicates = await leadRepository.aggregate([
                { $match: { isDeleted: false } },
                {
                    $group: {
                        _id: '$email',
                        count: { $sum: 1 },
                        leads: { $push: { _id: '$_id', firstName: '$firstName', lastName: '$lastName' } }
                    }
                },
                { $match: { count: { $gt: 1 } } },
                { $sort: { count: -1 } }
            ]);

            logger.info('Potential duplicates found', { count: duplicates.length });
            return duplicates;
        } catch (error) {
            logger.error('Error finding potential duplicates:', error);
            return [];
        }
    }

    /**
     * Get duplicate report
     * @returns {Promise<Object>} Duplicate report with statistics
     */
    static async getDuplicateReport() {
        try {
            logger.info('Generating duplicate report');

            const duplicates = await this.findPotentialDuplicates();

            const report = {
                totalDuplicateGroups: duplicates.length,
                totalDuplicateLeads: duplicates.reduce((sum, group) => sum + group.count, 0),
                duplicates: duplicates,
                generatedAt: new Date().toISOString()
            };

            logger.info('Duplicate report generated', { groups: report.totalDuplicateGroups });
            return report;
        } catch (error) {
            logger.error('Error generating duplicate report:', error);
            throw error;
        }
    }
}

module.exports = DuplicateCheckService;
