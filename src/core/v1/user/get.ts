import { TokenPayload } from 'common/types';

import { statusCodes, userConstants } from './../../../common/config/constants';
import { db } from './../../../common/db';
import { ErrorHandler } from './../../../common/error';
import { UserApi } from './../../../common/types/api';

const get = async (payload: any): Promise<UserApi['Get']['Response']> => {
    console.log('get', payload);
    try {
        const user = await db.user.findUnique({
            where: {
                authId: payload?.sessionClaims?.sub as string
            }
        });
        if (!user) {
            throw new ErrorHandler(
                statusCodes.NOT_FOUND,
                userConstants.NOT_FOUND
            );
        }
        return user;
    } catch (error) {
        throw new ErrorHandler(error.statusCode, error.message);
    }
};

export default get;
