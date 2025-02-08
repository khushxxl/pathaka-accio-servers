import { User } from '@prisma/client';

import { db } from '../../../common/db';
import { ErrorHandler } from './../../../common/error';
import { TopicApi } from './../../../common/types/api';
import { ideas_completion } from './completion';

const create = async (
    newQuery: TopicApi['Create']['Request'],
    user: User
): Promise<TopicApi['Create']['Response']> => {
    try {
        const query = await db.topic.create({
            data: {
                ...newQuery,
                userId: user.id
            }
        });
        const podcast_idea = await ideas_completion(query);
        return podcast_idea;
    } catch (error) {
        throw new ErrorHandler(error.statusCode, error.message);
    }
};

export default create;
