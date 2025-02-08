import { TokenPayload } from 'common/types';
import { NextFunction, Request, Response } from 'express';

import { statusCodes } from '../../../../common/config/constants';
import { create as createCoreService } from './../../../../core/v1/user.core';

const create = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | undefined> => {
    try {
        // TODO (add to monorepo also): add validation: https://github.com/poolfoundation/server/blob/dev/src/controllers/v1/user/create.ts
        const response = await createCoreService(
            req.body,
            req.auth?.payload as TokenPayload
        );
        return res.status(statusCodes.SUCCESS).json(response);
    } catch (error) {
        next(error);
    }
};

export default create;
