import axios from 'axios';
import { logger } from '../../logger';

interface PerplexityResponse {
    choices: {
        message: {
            content: string;
        };
    }[];
}

const searchWithPerplexity = async (query: string): Promise<string> => {
    try {
        logger.info(`Querying Perplexity with: "${query}"`);

        const response = await axios.post(
            'https://api.perplexity.ai/chat/completions',
            {
                model: 'llama-3.1-sonar-small-128k-online',
                messages: [{ role: 'user', content: query }],
                temperature: 0.2,
                return_images: false,
                return_related_questions: false,
                presence_penalty: 0.5,
                max_tokens: 2500
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const content = response.data.choices[0].message.content;

        logger.info('=== Perplexity Response ===');
        logger.info(`Query: ${query}`);
        logger.info('Full response:');
        logger.info(content);
        logger.info('========================');

        return content;
    } catch (error) {
        logger.error('Perplexity API error:', error);
        throw error;
    }
};

const generateFactSheetResearch = async (query: string): Promise<string> => {
    try {
        logger.info(`Generating factsheet research for: "${query}"`);
        return searchWithPerplexity(
            `Very comprehensive and detailed research about: ${query}. Return full sentences and include historical context, key developments, biographical details, current state, and future implications.`
        );
    } catch (error) {
        logger.error('Perplexity factsheet research error:', error);
        throw error;
    }
};

const searchMultipleWithPerplexity = async (
    queries: string[]
): Promise<Map<string, string>> => {
    try {
        logger.info(`Batch querying Perplexity with ${queries.length} queries`);

        const results = await Promise.all(
            queries.map((query) => searchWithPerplexity(query))
        );

        // Create a map of query -> result
        const queryResults = new Map<string, string>();
        queries.forEach((query, index) => {
            queryResults.set(query, results[index]);
        });

        return queryResults;
    } catch (error) {
        logger.error('Perplexity batch query error:', error);
        throw error;
    }
};

export {
    searchWithPerplexity,
    generateFactSheetResearch,
    searchMultipleWithPerplexity
};
