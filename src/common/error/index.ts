import { Response } from 'express';

import { logger } from '../logger';

interface IErrorHandler extends Error {
    statusCode: number;
    message: string;
    name: string;
}

class ErrorHandler extends Error implements IErrorHandler {
    statusCode: number;
    message: string;
    name: string;

    constructor(statusCode: number, message: string) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.message = message;
    }
}

const handleError = (error: IErrorHandler, res: Response): Response => {
    const { message } = error;
    let { statusCode } = error;
    if (!statusCode) {
        statusCode = 500;
    }
    logger.error(statusCode);
    logger.error(message);
    logger.error(error.stack);
    return res.status(statusCode).json({
        status: 'error',
        statusCode,
        message
    });
};

export { ErrorHandler, handleError };
