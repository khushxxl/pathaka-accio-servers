import { MessageParam } from '@anthropic-ai/sdk/resources';
import { SearchResponse } from './../../../common/types/search';
import { logger } from './../../../common/logger';
import { getSystemPrompt } from './systemprompts';
import { searchMultipleWithPerplexity } from '../perplexity';
import { getTaggingInstructions } from './tagInstructions';

// THIS FILE CONTAINS THE FACTSHEET, OUTLINE AND SCRIPT SECTION PROMPTS FOR CONVERSATIONAL SCRIPTS 

interface Prompt {
    systemPrompt: string;
    messages: MessageParam[];
}

export interface Outline {
    title: string;
    introduction: {
        hook: string;
        main_themes: string[];
        narrative_setup: string;
    };
    subtopics: {
        title: string;
        key_point: string;
        supporting_evidence: string;
        narrative_connection: string;
        search_query: string;
    }[];
    conclusion: {
        key_insights: string[];
        fascinating_elements: string[];
        final_thoughts: string;
    };
}

interface PromptParams {
    factSheet: string;
    outline: Outline;
    sectionName: string;
    wordCountGoal: number;
    speakerConfig: {
        host: { gender: 'male' | 'female'; name: string };
        coHost: { gender: 'male' | 'female'; name: string };
    };
    previousScript?: string;
}

let subtopicResearchCache = new Map<string, string>();

const prefetchSubtopicResearch = async (outline: Outline) => {
    const queries = outline.subtopics.map(subtopic => subtopic.search_query);
    subtopicResearchCache = await searchMultipleWithPerplexity(queries);
};


// FACTSHEET PROMPT

const generateFactSheetPrompt = ({
    query,
    searchResults
}: {
    query: string;
    searchResults: SearchResponse;
}): Prompt => {
    const systemPrompt =
        'You are a helpful research assistant. Your response must be valid JSON with properly escaped characters.';

    const messages: MessageParam[] = [
        {
            role: 'user',
            content: `Analyze the search results and create a research summary and image prompt.

Return ONLY a JSON object in this exact format:
{
    "factsheet": "YOUR_FACTSHEET_TEXT_HERE",
    "imagePrompt": {
        "description": "A clear, simple description for an AI image generator. Focus on subject, pose, setting, and mood. Do not include camera or photographic directions."
    }
}

Guidelines for the factsheet text:
- Write in full sentences
- Use only plain text and avoid special characters when possible
- Properly escape any necessary quotes or special characters
- Do not use line breaks within the factsheet text

Include these points in your factsheet:
- Timeline and evolution of the topic
- Key turning points
- Notable figures and contributions
- Quantifiable data and statistics
- Technological breakthroughs
- Current developments
- Cultural/economic implications
- Applications
- Controversies
- Key insights
- Contrasting viewpoints
- Ongoing debates
- Surprising discoveries
- Memorable analogies
- Human interest angles

Guidelines for the image prompt:
- Take inspiration from the ${query}
- Keep it concise and descriptive
- Focus on visual elements only
- Include subject matter, pose, setting, and mood where relevant
- Avoid technical photography terms or direction
- Ensure the image would be suitable for a podcast cover or promotional material

Query: "${query}"
Content: ${searchResults}`
        }
    ];

    return { systemPrompt, messages };
};

// OUTLINE PROMPT

const generateOutlinePrompt = ({
    factSheet
}: {
    factSheet: string;
}): Prompt => {
    const systemPrompt =
        'You are an experienced podcast writer. Using the fact sheet and search results provided, create a detailed outline for a ~4300 word script.';

    const messages: MessageParam[] = [
        {
            role: 'user',
            content: `You are a podcast outline generator. Using the context provided below, create a compelling podcast outline formatted as a JSON array. The outline should include:

                Fact Sheet: ${factSheet}
                
                1. An introduction that establishes a hook for the audience for why they should listen, and a very brief overview of the topic
                2. Five very distinct subtopics that explore the topic and factsheet elements, each with a ten-line summary explaining:
                    - The 3 or 4 key points or arguments in this subtopic
                    - Supporting evidence, examples and controversies. This section should be substantial in length 
                    - How it connects to the broader narrative
                    - A natural language search query containing a detailed multi-part question that can be used by a natural language search engine to discover the most relevant and richest information about the particular subtopic
                3. A conclusion that synthesizes the most fascinating points and intriguing elements discussed

                The outline should maintain a narrative flow, with each subtopic linking with the previous one. 

                [CONTEXT]
                {context}
                [END CONTEXT]

                Return the outline AND tags in the following JSON format:

                {
                    "outline": {
                        "title": "string",
                        "introduction": {
                            "hook": "string",
                            "main_themes": ["string"],
                            "narrative_setup": "string"
                        },
                        "subtopics": [
                            {
                                "title": "string",
                                "key_point": "string",
                                "supporting_evidence": "string",
                                "narrative_connection": "string",
                                "search_query": "string"
                            }
                        ],
                        "conclusion": {
                            "key_insights": ["string"],
                            "fascinating_elements": ["string"],
                            "final_thoughts": "string"
                        }
                    },
                    "tags": {
                        "genre": "string",
                        "subgenre": "string",
                        "keywords": ["string"]
                    }
                }

                ${getTaggingInstructions()}

                ##FURTHER SUBTOPIC GUIDELINES 

                - Ensure each subtopic is interesting, distinctive, and does not overlap with any another subtopic 
                - Avoid surface-level observations 
                - Make explicit connections between subtopics to create a reasonably cohesive narrative thread throughout the podcast.
                - If applicable, make at least one subtopic the focus of biographical, or backstory material.
                - If applicable, make one subtopic the focus of controversies and debates.
                - When appropriate, include a 'breakthrough moment' where key revelations occur within at least one subtopic.
                - Generate 5 subtopics 
            `
        }
    ];

    return { systemPrompt, messages };
};

const generateIntroPrompt = ({
    factSheet,
    outline,
    sectionName,
    wordCountGoal,
    speakerConfig
}: PromptParams): Prompt => {
    const systemPrompt = getSystemPrompt(speakerConfig);

    const messages: MessageParam[] = [
        {
            role: 'user',
            content: `
            You are creating the introduction for a podcast episode. Focus on the "${sectionName}" section.

            ## CONTEXT AND RESEARCH
            Factsheet Content: ${factSheet}
            Title: ${outline.title}

            ## INTRODUCTION ELEMENTS
            Hook: ${outline.introduction.hook}
            Main Themes: ${outline.introduction.main_themes.join(', ')}
            Narrative Setup: ${outline.introduction.narrative_setup}

            ## UPCOMING SUBTOPICS (for context)
            ${outline.subtopics.map((st, i) =>
                `${i + 1}. ${st.title}: ${st.key_point}`
            ).join('\n')}

            ## SPEAKER CONFIGURATION
            <${speakerConfig.host.name}> is the host (${speakerConfig.host.gender})
            <${speakerConfig.coHost.name}> is the co-host (${speakerConfig.coHost.gender})

            ## TASK
            Create a ${wordCountGoal}-word introduction that:
            - Opens with a warm welcome and introduces both hosts
            - Uses the hook to grab audience attention
            - Introduces the main themes naturally through dialogue
            - Sets up the narrative direction for the episode
            - Hints at the fascinating journey ahead
            - Maintains natural conversation flow
            - Ends with: <break time="1.0s" />

            Remember to follow all TTS rules in the system prompt for proper audio generation.
            `
        }
    ];

    return { systemPrompt, messages };
};

const generateMainPrompt = async ({
    factSheet,
    sectionName,
    wordCountGoal,
    subtopic,
    outline,
    speakerConfig,
    previousScript
}: {
    factSheet: string;
    sectionName: string;
    wordCountGoal: number;
    subtopic: Outline['subtopics'][0];
    outline: Outline;
    speakerConfig: any;
    previousScript?: string;
}): Promise<Prompt> => {
    const systemPrompt = getSystemPrompt(speakerConfig);
    const searchQuery = subtopic.search_query;
    const researchContent = subtopicResearchCache.get(searchQuery) || '';

    const messages: MessageParam[] = [
        {
            role: 'user',
            content: `
            You have a fact sheet and a detailed outline for a podcast script. Focus on the "${sectionName}" section.

            ## CONTEXT
            Factsheet: ${factSheet}
            Research: ${researchContent}
            ${previousScript ? `\nPrevious Script:\n${previousScript}` : ''}

            ## CURRENT SUBTOPIC
            Title: ${subtopic.title}
            Key Point: ${subtopic.key_point}
            Supporting Evidence: ${subtopic.supporting_evidence}
            Narrative Connection: ${subtopic.narrative_connection}

            ## SPEAKER CONFIGURATION
            <${speakerConfig.host.name}> is the host (${speakerConfig.host.gender})
            <${speakerConfig.coHost.name}> is the co-host (${speakerConfig.coHost.gender})

            ## GUIDELINES
            Create ${wordCountGoal} words that:
            - Continue naturally from the previous content
            - Explore this subtopic in detail with examples
            - Avoid repeating information from previous sections
            - Connect points smoothly without forced transitions
            - Build on previous discussion minimizing any repetition of material and content from other subtopics
            - Use creative transitions between subtopics like:
                - "Let me take you back to..."
                - "This is another point that we should address..."
                - "Speaking of which, there's this fascinating detail about..."
                - "There's another layer to this story that we haven't explored yet..."
            - End with: <break time="1.0s" />
            `
        }
    ];

    return { systemPrompt, messages };
};

const generateConclusionPrompt = ({
    factSheet,
    outline,
    sectionName,
    wordCountGoal,
    speakerConfig,
    previousScript
}: {
    factSheet: string;
    outline: Outline;
    sectionName: string;
    wordCountGoal: number;
    speakerConfig: {
        host: { gender: 'male' | 'female'; name: string };
        coHost: { gender: 'male' | 'female'; name: string };
    };
    previousScript?: string;
}): Prompt => {
    const conclusion = '';
    const systemPrompt = getSystemPrompt(speakerConfig);

    const messages: MessageParam[] = [
        {
            role: 'user',
            content: `
        You have a fact sheet and a detailed outline for a ~4300 word podcast script. Focus on the "${sectionName}" section.

        ## SPEAKER CONFIGURATION
        <${speakerConfig.host.name}> is the host (${speakerConfig.host.gender})
        <${speakerConfig.coHost.name}> is the co-host (${speakerConfig.coHost.gender})

        Your task is to write a conclusion for the podcast conversation:

        Context: ${factSheet}
        Key insights: ${outline.conclusion.key_insights}
        Fascinating elements: ${outline.conclusion.fascinating_elements}
        Final thoughts: ${outline.conclusion.final_thoughts}

        ${previousScript ? `\nPrevious Script:\n${previousScript}` : ''}
        
        ${conclusion ? `this is a previous conclusion: ${conclusion} continue here smoothly` : 'Create a 300 word conclusion'}
        
        ## Response Example: 
        Always identify speakers using their exact names in angle brackets:
        <${speakerConfig.host.name}> and <${speakerConfig.coHost.name}>

        Example:
        <${speakerConfig.host.name}>: <excited> You know, the idea of vertical flight has captured human imagination for centuries! </excited>

        <${speakerConfig.coHost.name}>: <intrigued> Hmm, really? I didn't realize the concept went back that far. What kind of early designs are you referring to?
                Create ${wordCountGoal} words that:
                - Wrap up key insights organically through dialogue
                - Discuss broader implications
                - End with an engaging final thought
                - Maintain the conversational tone
                - Avoid repeating sentences and thoughts wholesale from subtopics or the introduction. 
        `
        }
    ];

    return { systemPrompt, messages };
};

const generateTopicPrompt = ({ query }: { query: string }): Prompt => {
    const systemPrompt =
        'You are a podcast topic generator. Create engaging podcast topic ideas based on the user\'s interest".';
    const messages: MessageParam[] = [
        {
            role: 'user',
            content: `
                    Based on the user's interest in "${query}", suggest six specific, engaging podcast topic ideas. 
                    INSTRUCTIONS:
                    - Ideas one and three should be very, very similar to the user's query ${query}
                    - Ideas two, four, five and six should be creatively varied from the user's query ${query}

                    Format the response as a JSON array of objects, where each object has:
                    {
                    "title": "A catchy title for the podcast episode",
                    "description": "A brief, engaging description of what the episode would cover (2-3 sentences)",
                    "tags": ["array", "of", "relevant", "keywords"]
                    }
                    
                    Make the topics specific, interesting, and diverse within the general theme. Avoid generic suggestions.
                    Ensure the response is valid JSON format.
                `
        }
    ];
    return { systemPrompt, messages };
};

export {
    generateConclusionPrompt,
    generateFactSheetPrompt,
    generateIntroPrompt,
    generateMainPrompt,
    generateOutlinePrompt,
    generateTopicPrompt,
    prefetchSubtopicResearch
};
