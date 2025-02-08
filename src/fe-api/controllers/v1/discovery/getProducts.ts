import { TokenPayload } from 'common/types';
import { NextFunction, Request, Response } from 'express';

import { statusCodes } from '../../../../common/config/constants';
import { getProducts as getProductsCoreService } from './../../../../core/v1/discovery.core';

const getProducts = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | undefined> => {
    try {
        const response = await getProductsCoreService(
            req.auth?.payload as TokenPayload
        );
        return res.status(statusCodes.SUCCESS).json(response);
    } catch (error) {
        next(error);
    }
};

export default getProducts;
