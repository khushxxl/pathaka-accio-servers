import { Anthropic } from '@anthropic-ai/sdk';
import { MessageParam } from '@anthropic-ai/sdk/resources';

import { logger } from './../../../common/logger';
import { configVariables } from './../../config/vars';

const anthropic = new Anthropic({
    apiKey: configVariables.ANTHROPIC_API_KEY
});

const generateCompletionClaude = async (
    prompt: MessageParam[],
    systemPrompt?: string
) => {
    try {
        // Input validation
        if (!prompt || !Array.isArray(prompt) || prompt.length === 0) {
            throw new Error(
                'Invalid prompt: Must be non-empty array of messages'
            );
        }

        // Retry mechanism
        let attempts = 0;
        const maxAttempts = 3;

        while (attempts < maxAttempts) {
            try {
                const res = await anthropic.messages.create({
                    model: 'claude-3-5-sonnet-20241022',
                    max_tokens: 7096,
                    temperature: 0.65,
                    system: systemPrompt || 'You are a helpful assistant.',
                    messages: prompt
                });

                if (!(res.content?.[0] as Anthropic.Messages.TextBlock)?.text) {
                    throw new Error('Invalid API response structure');
                }

                return (res.content[0] as Anthropic.Messages.TextBlock).text;
            } catch (error) {
                attempts++;
                if (attempts === maxAttempts) {
                    throw error;
                }
                await new Promise((resolve) =>
                    setTimeout(resolve, 1000 * attempts)
                );
            }
        }

        throw new Error('Max retry attempts reached');
    } catch (error) {
        logger.error('Claude API Error:', error);
        return {
            content: '',
            error:
                error instanceof Error
                    ? error.message
                    : 'Unknown error occurred'
        };
    }
};

const generateCompletionTopicClaude = async (
    prompt: MessageParam[],
    systemPrompt?: string
) => {
    try {
        // Input validation
        if (!prompt || !Array.isArray(prompt) || prompt.length === 0) {
            throw new Error(
                'Invalid prompt: Must be non-empty array of messages'
            );
        }

        // Retry mechanism
        let attempts = 0;
        const maxAttempts = 3;

        while (attempts < maxAttempts) {
            try {
                const res = await anthropic.messages.create({
                    model: 'claude-3-5-haiku-20241022',
                    max_tokens: 750,
                    temperature: 0.8,
                    system: systemPrompt || 'You are a podcast topic generator, creating engaging and varied podcast topics. The year is 2025.',
                    messages: prompt
                });

                if (!(res.content?.[0] as Anthropic.Messages.TextBlock)?.text) {
                    throw new Error('Invalid API response structure');
                }

                return (res.content[0] as Anthropic.Messages.TextBlock).text;
            } catch (error) {
                attempts++;
                if (attempts === maxAttempts) {
                    throw error;
                }
                await new Promise((resolve) =>
                    setTimeout(resolve, 1000 * attempts)
                );
            }
        }

        throw new Error('Max retry attempts reached');
    } catch (error) {
        logger.error('Claude API Error:', error);
        return {
            content: '',
            error:
                error instanceof Error
                    ? error.message
                    : 'Unknown error occurred'
        };
    }
};

const generateCompletionCategoryClaude = async (
    prompt: MessageParam[],
    systemPrompt?: string
) => {
    try {
        // Input validation
        if (!prompt || !Array.isArray(prompt) || prompt.length === 0) {
            throw new Error(
                'Invalid prompt: Must be non-empty array of messages'
            );
        }

        // Retry mechanism
        let attempts = 0;
        const maxAttempts = 3;

        while (attempts < maxAttempts) {
            try {
                const res = await anthropic.messages.create({
                    model: 'claude-3-5-haiku-20241022',
                    max_tokens: 700,
                    temperature: 0.5,
                    system: systemPrompt || 'You are a tagging expert, specializing in categorizing content with relevant and precise tags.',
                    messages: prompt
                });

                if (!(res.content?.[0] as Anthropic.Messages.TextBlock)?.text) {
                    throw new Error('Invalid API response structure');
                }

                return (res.content[0] as Anthropic.Messages.TextBlock).text;
            } catch (error) {
                attempts++;
                if (attempts === maxAttempts) {
                    throw error;
                }
                await new Promise((resolve) =>
                    setTimeout(resolve, 1000 * attempts)
                );
            }
        }

        throw new Error('Max retry attempts reached');
    } catch (error) {
        logger.error('Claude API Error:', error);
        return {
            content: '',
            error:
                error instanceof Error
                    ? error.message
                    : 'Unknown error occurred'
        };
    }
};

// CAN WE CLEAN UP THIS SECTION OF THE CODE? I'M NOT SURE IT IS BEING USED. 
// const openai = new OpenAI({
//     apiKey: configVariables.OPEN_AI_API_KEY
// });

// const generateCompletion = async (
//     prompt: OpenAI.Chat.Completions.ChatCompletionMessageParam[]
// ) => {
//     const res = await openai.chat.completions.create({
//         model: 'gpt-4o',
//         messages: prompt
//     });

//     return res.choices[0].message.content;
// };

export {
    generateCompletionCategoryClaude,
    //    generateCompletion,
    generateCompletionClaude,
    generateCompletionTopicClaude};
