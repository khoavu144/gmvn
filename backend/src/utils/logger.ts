import winston from 'winston';
import { getEnv } from '../config/env';

const env = getEnv();
const isProduction = env.NODE_ENV === 'production';

const devFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.errors({ stack: true }),
    winston.format.printf((info) => {
        const reqId = info.reqId ? ` [reqId=${info.reqId}]` : '';
        const meta = info.meta ? ` ${JSON.stringify(info.meta)}` : '';
        return `${info.timestamp} [${info.level.toUpperCase()}]${reqId}: ${info.message}${meta}${info.stack ? `\n${info.stack}` : ''}`;
    }),
);

const prodFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
);

export const logger = winston.createLogger({
    level: isProduction ? 'info' : 'debug',
    format: isProduction ? prodFormat : devFormat,
    transports: [
        new winston.transports.Console(),
    ],
});
