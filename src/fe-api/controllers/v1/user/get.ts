import { TokenPayload } from 'common/types';
import { NextFunction, Request, Response } from 'express';

import { statusCodes } from '../../../../common/config/constants';
import { get as getCoreService } from './../../../../core/v1/user.core';

const get = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | undefined> => {
    try {
        // TODO (add to monorepo also): add validation: https://github.com/poolfoundation/server/blob/dev/src/controllers/v1/user/create.ts
        const response = await getCoreService(req.auth as any);
        return res.status(statusCodes.SUCCESS).json(response);
    } catch (error) {
        next(error);
    }
};

export default get;
