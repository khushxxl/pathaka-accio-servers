import axios from 'axios';
import { logger } from './../../../common/logger';
import { RawSearchResponse, SearchResponse } from './../../../common/types/search';

const webSearch = async (query: string): Promise<{ results: SearchResponse }> => {
    const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&summary=1&count=8`;
    try {
        const response = await axios.get(url, {
            headers: {
                Accept: 'application/json',
                'Accept-Encoding': 'gzip',
                'X-Subscription-Token': process.env.BRAVE_API_KEY
            }
        });

        if (response.status === 200) {
            const data = response.data as RawSearchResponse;
            const result: SearchResponse = {
                web: data.web.results.map((result) => ({
                    url: result.url,
                    title: result.title,
                    description: result.description,
                    favicon: result.meta_url.favicon,
                    website: result.meta_url.hostname
                }))
            };
            return { results: result };
        } else {
            throw new Error(`Request failed with status code ${response.status}`);
        }
    } catch (error) {
        logger.error('Error during Brave Web Search:', error);
        throw error;
    }
};

export { webSearch, SearchResponse };
