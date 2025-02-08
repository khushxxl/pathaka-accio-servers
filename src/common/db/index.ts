import { PrismaClient } from '@prisma/client';

import { logger } from './../logger';

const db = new PrismaClient();

// Test db connection by querying the heartbeat table
// This is an empty table that is just used to check if the db is up
db.heartbeart
    .findMany()
    .then(() => {
        logger.info('DB: Connected');
    })
    .catch((_: unknown) => {
        logger.error('Error connecting to the DB');
        process.exit(1);
    });

export { db };
