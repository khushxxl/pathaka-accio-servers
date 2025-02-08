import { NextFunction, Request, Response } from 'express';

import { statusCodes } from '../../../../common/config/constants';
import { create as createCoreService } from './../../../../core/v1/topic.core';

const create = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | undefined> => {
    try {
        const response = await createCoreService(req.body, res.locals.user);
        return res.status(statusCodes.SUCCESS).json(response);
    } catch (error) {
        next(error);
    }
};

export default create;
