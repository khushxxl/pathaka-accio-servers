// Imports
import { clerkMiddleware } from '@clerk/express';
import { json, urlencoded } from 'body-parser';
import cors from 'cors';
import express, { Application, NextFunction, Request, Response } from 'express';
import helmet from 'helmet';

import { statusCodes } from '../common/config/constants';
import { handleError } from './../common/error';
import { logger } from './../common/logger';
import { IErrorHandler } from './../common/types';
import { configVariables } from './config/vars';
import {
    discoveryRouter,
    oauthRouter,
    queryRouter,
    recommendationRouter,
    topicRouter,
    // Automation: importRoute
    userRouter
} from './routes/api/v1';

// Create application
const app: Application = express();

// Auth
app.use(clerkMiddleware());

// Application config
app.use(helmet());
app.use(cors());

app.use((req, _res, next) => {
    if (req.url === '/fe-api/healthcheck') {
        return next();
    }
    logger.info(`ENDPOINT: ${req.method} ${req.url}`);
    next();
});

app.use(json({ limit: '50mb' }));

app.use(urlencoded({ extended: true, limit: '50mb' }));

app.use('/fe-api/v1/queries', queryRouter);
app.use('/fe-api/v1/topics', topicRouter);
// Automation: addRoute
app.use('/fe-api/v1/users', userRouter);
app.use('/fe-api/v1/oauth', oauthRouter);
app.use('/fe-api/v1/discovery', discoveryRouter);
app.use('/fe-api/v1/recommendations', recommendationRouter);

// Health check
app.get('/fe-api/healthcheck', (_req, res) => {
    res.status(statusCodes.SUCCESS).json({
        data: 'ok',
        service: 'api',
        env: configVariables.NODE_ENV
    });
});

// Version
app.get('/fe-api/version', (_req, res) => {
    res.status(statusCodes.SUCCESS).json({
        version: `v${configVariables.IMAGE_TAG}`
    });
});

// Catch all
app.use('*', (req, res) => {
    logger.warn(`ENDPOINT: ${req.method} ${req.originalUrl} not found`);
    res.status(statusCodes.NOT_FOUND).json({
        status: 'Catch All',
        service: 'api',
        env: configVariables.NODE_ENV
    });
});

// Error handling
app.use(
    (
        error: IErrorHandler,
        req: Request,
        res: Response,
        _next: NextFunction
    ) => {
        logger.error(`ENDPOINT: ${req.method} ${req.url}`);
        handleError(error, res);
    }
);

export { app };
