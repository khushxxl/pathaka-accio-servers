import { NextFunction, Request, Response } from 'express';

import { statusCodes } from '../../../../common/config/constants';
import { get as getCoreService } from './../../../../core/v1/query.core';

const get = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | undefined> => {
    try {
        const response = await getCoreService(req.params.id, res.locals.user);
        return res.status(statusCodes.SUCCESS).json(response);
    } catch (error) {
        next(error);
    }
};

export default get;
