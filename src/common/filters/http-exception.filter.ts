import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        const message =
            exception instanceof HttpException
                ? exception.getResponse()
                : 'Internal server error';

        // Log the error for debugging
        if (status === 400 && typeof message === 'object') {
            console.error('Validation Error (400):', {
                path: ctx.getRequest().url,
                errors: (message as any).message
            });
        } else {
            console.error('Exception caught in filter:', exception);
        }

        response.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: ctx.getRequest().url,
            message: typeof message === 'string' ? message : (message as any).message || message,
            success: false,
        });
    }
}
