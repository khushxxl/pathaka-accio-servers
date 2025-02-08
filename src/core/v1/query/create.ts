import { User } from '@prisma/client';

import { db } from '../../../common/db';
import { ErrorHandler } from './../../../common/error';
import { QueryApi } from './../../../common/types/api';
import { completion } from './completion';

const create = async (
    newQuery: QueryApi['Create']['Request'],
    user: User
): Promise<QueryApi['Create']['Response']> => {
    try {
        const query = await db.query.create({
            data: {
                ...newQuery,
                userId: user.id
            }
        });
        const result = await completion(query);
        return result;
    } catch (error) {
        throw new ErrorHandler(error.statusCode, error.message);
    }
};

export default create;
