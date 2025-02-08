import { User } from '@prisma/client';

import {
    queryConstants,
    statusCodes
} from './../../../common/config/constants';
import { db } from './../../../common/db';
import { ErrorHandler } from './../../../common/error';
import { TopicApi } from './../../../common/types/api';

const get = async (
    topicId: TopicApi['Get']['Request'],
    user: User
): Promise<TopicApi['Get']['Response']> => {
    try {
        const topic = await db.topic.findUnique({
            where: {
                id: topicId,
                userId: user.id
            }
        });
        if (!topic) {
            throw new ErrorHandler(
                statusCodes.NOT_FOUND,
                queryConstants.NOT_FOUND
            );
        }
        return topic;
    } catch (error) {
        throw new ErrorHandler(error.statusCode, error.message);
    }
};

export default get;
