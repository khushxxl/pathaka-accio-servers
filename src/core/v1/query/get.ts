import { User } from '@prisma/client';

import {
    queryConstants,
    statusCodes
} from './../../../common/config/constants';
import { db } from './../../../common/db';
import { ErrorHandler } from './../../../common/error';
import { QueryApi } from './../../../common/types/api';

const get = async (
    queryId: QueryApi['Get']['Request'],
    user: User
): Promise<QueryApi['Get']['Response']> => {
    try {
        const query = await db.query.findUnique({
            where: {
                id: queryId,
                userId: user.id
            }
        });
        if (!query) {
            throw new ErrorHandler(
                statusCodes.NOT_FOUND,
                queryConstants.NOT_FOUND
            );
        }
        return query;
    } catch (error) {
        throw new ErrorHandler(error.statusCode, error.message);
    }
};

export default get;
