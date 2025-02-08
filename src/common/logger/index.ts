import { createLogger, format, transports } from 'winston';

const transportType = new transports.Console({
    level: process.env.LOG_LEVEL || 'silly',
    format: format.combine(
        format.align(),
        format.colorize(),
        format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss',
            alias: 'timestamp'
        }),
        format.printf(
            (info) => `${info.timestamp} | ${info.level} ${info.message}`
        )
    )
});

if (process.env.NODE_ENV === 'test') {
    transportType.silent = true;
}

const logger = createLogger({
    transports: transportType
});

export { logger };
