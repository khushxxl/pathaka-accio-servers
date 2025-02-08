import * as dotenv from 'dotenv';

import { logger } from './../../../common/logger';

dotenv.config();

export const configVariables = {
    NODE_ENV: process.env.NODE_ENV,
    DB_URL: process.env.DB_URL,
    LOG_LEVEL: process.env.LOG_LEVEL,
    IMAGE_TAG: process.env.IMAGE_TAG,
    CLERK_PUBLISHABLE_KEY: process.env.CLERK_PUBLISHABLE_KEY,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    PODCASTS_STORE_BUCKET: process.env.PODCASTS_STORE_BUCKET,
    ACCESS_KEY_AWS: process.env.ACCESS_KEY_AWS,
    SECRET_KEY_AWS: process.env.SECRET_KEY_AWS
};

for (const key in configVariables) {
    if (!configVariables[key as keyof typeof configVariables]) {
        logger.error(`Missing config variable: ${key}`);
    }
}

if (Object.values(configVariables).every(Boolean)) {
    logger.info('CONFIG: success');
}
