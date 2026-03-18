import winston from 'winston';
import { getEnv } from '../config/env';

const env = getEnv();

const format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.printf((info) => {
        const reqId = info.reqId ? ` [reqId=${info.reqId}]` : '';
        return `${info.timestamp} [${info.level.toUpperCase()}]${reqId}: ${info.message}${info.stack ? `\n${info.stack}` : ''}`;
    })
);

export const logger = winston.createLogger({
    level: env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: format,
    transports: [
        new winston.transports.Console()
    ],
});
