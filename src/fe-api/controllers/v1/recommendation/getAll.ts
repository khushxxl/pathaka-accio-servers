import { NextFunction, Request, Response } from 'express';

import { statusCodes } from '../../../../common/config/constants';
import { getAll as getAllCoreService } from './../../../../core/v1/recommendation.core';
const getAll = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | undefined> => {
    try {
        const response = await getAllCoreService();
        return res.status(statusCodes.SUCCESS).json(response);
    } catch (error) {
        next(error);
    }
};

export default getAll;
