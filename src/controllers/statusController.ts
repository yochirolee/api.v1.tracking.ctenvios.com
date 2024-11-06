import { Request, Response } from 'express';
import { ParcelStatus } from '@prisma/client';

export class StatusController {
    /**
     * Get all available parcel statuses
     */
    public getAllStatuses(req: Request, res: Response) {
        try {
            const statuses = Object.values(ParcelStatus);
            return res.status(200).json(statuses);
        } catch (error) {
            return res.status(500).json({ error: 'Failed to retrieve parcel statuses' });
        }
    }

    /**
     * Get a single status by value
     */
    public getStatus(req: Request, res: Response) {
        try {
            const { status } = req.params;
            if (status in ParcelStatus) {
                return res.status(200).json({ status: ParcelStatus[status as keyof typeof ParcelStatus] });
            }
            return res.status(404).json({ error: 'Status not found' });
        } catch (error) {
            return res.status(500).json({ error: 'Failed to retrieve status' });
        }
    }

    /**
     * Validate if a status exists
     */
    public validateStatus(req: Request, res: Response) {
        try {
            const { status } = req.body;
            const isValid = Object.values(ParcelStatus).includes(status);
            return res.status(200).json({ isValid });
        } catch (error) {
            return res.status(500).json({ error: 'Failed to validate status' });
        }
    }
} 