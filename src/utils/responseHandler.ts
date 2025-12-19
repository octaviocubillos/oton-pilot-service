import { Response } from 'express';

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: any;
}

export class ResponseHandler {
    static success<T>(res: Response, data: T, message?: string, statusCode: number = 200): void {
        const response: ApiResponse<T> = {
            success: true,
            data,
            message
        };
        res.status(statusCode).json(response);
    }

    static error(res: Response, message: string, error?: any, statusCode: number = 500): void {
        const response: ApiResponse<null> = {
            success: false,
            message,
            error
        };
        res.status(statusCode).json(response);
    }
}
