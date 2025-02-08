import { logger } from 'common/logger';
import { MessageParam } from '@anthropic-ai/sdk/resources';

export async function generateSummary(script: string): Promise<string> {
    if (!process.env.ANTHROPIC_API_KEY) {
        throw new Error('Anthropic API key not configured');
    }

    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'anthropic-version': '2023-06-01',
                'x-api-key': process.env.ANTHROPIC_API_KEY
            },
            body: JSON.stringify({
                model: 'claude-3-haiku-20240307',
                max_tokens: 1024,
                system: 'You are a podcast summarizer. Create a detailed summary focusing on key points, main arguments, and important takeaways.',
                messages: [
                    {
                        role: 'user',
                        content: `Please analyze this podcast script and provide a structured summary in the following JSON format:
                        {
                            "key_points": ["array of main points discussed"],
                            "main_arguments": ["array of key arguments presented"],
                            "supporting_evidence": ["array of evidence and examples used"],
                            "takeaways": ["array of important lessons or insights"],
                            "fascinating_elements": ["array of interesting or surprising facts"],
                            "detailed_summary": "A comprehensive narrative summary of the content"
                        }
                        
                        Podcast script:
                        ${script}`
                    }
                ] as MessageParam[]
            })
        });

        if (!response.ok) {
            throw new Error(
                `API request failed: ${response.status} ${response.statusText}`
            );
        }

        const result = await response.json();
        if (!result.completion) {
            throw new Error('No summary content in response');
        }

        return result.completion;
    } catch (error) {
        logger.error('Error generating summary:', error);
        throw error;
    }
}
