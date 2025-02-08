import * as dotenv from 'dotenv';

import { logger } from './../../../common/logger';

dotenv.config();

export const configVariables = {
    OPEN_AI_API_KEY: process.env.OPEN_AI_API_KEY,
    BRAVE_API_KEY: process.env.BRAVE_API_KEY,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    APP_BASE_URL: process.env.APP_BASE_URL,
    SEARCHAPI_API_KEY: process.env.SEARCHAPI_API_KEY,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    ELEVEN_LABS_API_KEY: process.env.ELEVEN_LABS_API_KEY,
    ACCESS_KEY_AWS: process.env.ACCESS_KEY_AWS,
    SECRET_KEY_AWS: process.env.SECRET_KEY_AWS
};

for (const key in configVariables) {
    if (!configVariables[key as keyof typeof configVariables]) {
        logger.error(`Missing config variable: ${key}`);
    }
}

if (Object.values(configVariables).every(Boolean)) {
    logger.info('COMMON CONFIG: success');
}
