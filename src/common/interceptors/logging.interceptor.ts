// src/common/interceptors/logging.interceptor.ts
import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger('HTTP');

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const { method, url, body } = request;
        const user = request.user;
        const userEmail = user ? user.email : 'anonymous';
        const now = Date.now();

        return next.handle().pipe(
            tap(() => {
                const response = context.switchToHttp().getResponse();
                const { statusCode } = response;
                const delay = Date.now() - now;

                if (['POST', 'PATCH', 'DELETE', 'PUT'].includes(method)) {
                    this.logger.log(
                        `${method} ${url} ${statusCode} - ${userEmail} - ${delay}ms`
                    );
                    if (Object.keys(body).length > 0) {
                        this.logger.debug(`Body: ${JSON.stringify(body)}`);
                    }
                }
            }),
        );
    }
}
