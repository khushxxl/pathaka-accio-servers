import { TokenPayload } from 'common/types';
import { NextFunction, Request, Response } from 'express';

import { statusCodes } from '../../../../../common/config/constants';
import { googleCallback } from './../../../../../core/v1/oauth.core';

const callback = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | undefined> => {
    try {
        const response = await googleCallback(
            req.body,
            req.auth?.payload as TokenPayload
        );
        return res.status(statusCodes.SUCCESS).json(response);
    } catch (error) {
        next(error);
    }
};

export default callback;
