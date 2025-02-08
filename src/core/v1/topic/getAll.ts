import { Topic, User } from '@prisma/client';

import {
    queryConstants,
    statusCodes
} from './../../../common/config/constants';
import { db } from './../../../common/db';
import { ErrorHandler } from './../../../common/error';
import { TopicApi } from './../../../common/types/api';

const getAll = async (user: User): Promise<TopicApi['GetAll']['Response']> => {
    try {
        const queries = await db.topic.findMany({
            where: {
                userId: user.id
            }
        });
        if (!queries) {
            throw new ErrorHandler(
                statusCodes.NOT_FOUND,
                queryConstants.NOT_FOUND
            );
        }
        const grouped: Record<string, Topic[]> = queries
            .reverse()
            .reduce((acc: Record<string, Topic[]>, item: Topic) => {
                const date = new Date(item.createdAt).toDateString();
                if (!acc[date]) {
                    acc[date] = [];
                }
                acc[date].push(item);
                return acc;
            }, {});
        return grouped;
    } catch (error) {
        throw new ErrorHandler(error.statusCode, error.message);
    }
};

export default getAll;
