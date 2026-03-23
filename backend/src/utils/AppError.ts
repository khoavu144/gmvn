export class AppError extends Error {
    public readonly statusCode: number;
    public readonly code: string;
    public readonly details?: unknown;
    public readonly isOperational: boolean;

    constructor(
        message: string,
        statusCode: number,
        code = 'API_ERROR',
        details?: unknown,
        isOperational = true,
    ) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        this.isOperational = isOperational;
        Error.captureStackTrace(this);
    }
}
