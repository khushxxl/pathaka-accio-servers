import { TokenPayload } from 'common/types';
import { NextFunction, Request, Response } from 'express';

import { statusCodes } from '../../../../common/config/constants';
import { personalisationStatus } from '../../../../core/v1/user.core';

const status = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | undefined> => {
    try {
        const response = await personalisationStatus(
            req.auth?.payload as TokenPayload
        );
        return res.status(statusCodes.SUCCESS).json(response);
    } catch (error) {
        next(error);
    }
};

export default status;
