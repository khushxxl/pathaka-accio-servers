import { Topic } from '@prisma/client';

import { db } from '../../../common/db';
import { logger } from './../../../common/logger';
import { generateCompletionTopicClaude } from './../../../common/modules/ai';
import { generateTopicPrompt } from './../../../common/modules/ai/prompts';

const ideas_completion = async (query: Topic): Promise<any> => {
    try {
        const topic_prompt = generateTopicPrompt({
            query: query.query
        });

        const podcast_idea = await generateCompletionTopicClaude(
            topic_prompt.messages,
            topic_prompt.systemPrompt
        );

        logger.info('Podcast Topic Ideas generated');

        await db.topic.update({
            where: {
                id: query.id
            },
            data: {
                podcastIdeas: podcast_idea.toString()
            }
        });
        return podcast_idea;
    } catch (error) {
        logger.error('Error in ideas completion:', error);
        throw error;
    }
};

export { ideas_completion };
