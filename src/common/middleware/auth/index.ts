import { NextFunction, Request, Response } from 'express';

import {
    generalConstants,
    statusCodes,
    userConstants
} from './../../config/constants';
import { db } from './../../db';
import { ErrorHandler } from './../../error';
import { getAuth } from '@clerk/express';

const checkJwt = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authResult = getAuth(req);

        if (!authResult.userId) {
            throw new ErrorHandler(
                statusCodes.UNAUTHORIZED,
                generalConstants.UNAUTHORIZED
            );
        }
        next();
    } catch (error) {
        next(error);
    }
};

const getUser = async (req: any, res: Response, next: NextFunction) => {
    try {
        const payload = req.auth?.sessionClaims;
        // console.log('from get user', payload);
        if (!payload) {
            throw new ErrorHandler(
                statusCodes.FORBIDDEN,
                generalConstants.FORBIDDEN
            );
        }
        const user = await db.user.findUnique({
            where: {
                authId: payload.sub
            }
        });
        if (!user) {
            throw new ErrorHandler(
                statusCodes.NOT_FOUND,
                userConstants.NOT_FOUND
            );
        }
        res.locals.user = user;
        next();
    } catch (error) {
        next(error);
    }
};

export { checkJwt, getUser };
