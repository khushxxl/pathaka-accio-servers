export interface ConfigVariables {
    OPEN_AI_API_KEY: string | undefined;
    BRAVE_API_KEY: string | undefined;
    GOOGLE_CLIENT_ID: string | undefined;
    GOOGLE_CLIENT_SECRET: string | undefined;
    APP_BASE_URL: string | undefined;
    INTERVAL: string | undefined;
    SEARCHAPI_API_KEY: string | undefined;
    ANTHROPIC_API_KEY: string | undefined;
    ELEVEN_LABS_API_KEY: string | undefined;
    STABILITY_AI_API_KEY: string | undefined;
    FIRECRAWL_API_KEY: string | undefined;
    PERPLEXITY_API_KEY: string | undefined;
}

export const configVariables: ConfigVariables = {
    OPEN_AI_API_KEY: process.env.OPEN_AI_API_KEY,
    BRAVE_API_KEY: process.env.BRAVE_API_KEY,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    APP_BASE_URL: process.env.APP_BASE_URL,
    INTERVAL: process.env.INTERVAL,
    SEARCHAPI_API_KEY: process.env.SEARCHAPI_API_KEY,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    ELEVEN_LABS_API_KEY: process.env.ELEVEN_LABS_API_KEY,
    STABILITY_AI_API_KEY: process.env.STABILITY_AI_API_KEY,
    FIRECRAWL_API_KEY: process.env.FIRECRAWL_API_KEY,
    PERPLEXITY_API_KEY: process.env.PERPLEXITY_API_KEY
};
