"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusController = void 0;
const client_1 = require("@prisma/client");
class StatusController {
    /**
     * Get all available parcel statuses
     */
    getAllStatuses(req, res) {
        try {
            const statuses = Object.values(client_1.ParcelStatus);
            return res.status(200).json(statuses);
        }
        catch (error) {
            return res.status(500).json({ error: 'Failed to retrieve parcel statuses' });
        }
    }
    /**
     * Get a single status by value
     */
    getStatus(req, res) {
        try {
            const { status } = req.params;
            if (status in client_1.ParcelStatus) {
                return res.status(200).json({ status: client_1.ParcelStatus[status] });
            }
            return res.status(404).json({ error: 'Status not found' });
        }
        catch (error) {
            return res.status(500).json({ error: 'Failed to retrieve status' });
        }
    }
    /**
     * Validate if a status exists
     */
    validateStatus(req, res) {
        try {
            const { status } = req.body;
            const isValid = Object.values(client_1.ParcelStatus).includes(status);
            return res.status(200).json({ isValid });
        }
        catch (error) {
            return res.status(500).json({ error: 'Failed to validate status' });
        }
    }
}
exports.StatusController = StatusController;
