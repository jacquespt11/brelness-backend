// src/common/guards/optional-jwt-auth.guard.ts
import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard optionnel : tente de décoder le JWT si présent mais
 * laisse toujours passer la requête (même sans token).
 * req.user sera défini si le token est valide, sinon undefined.
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
    canActivate(context: ExecutionContext) {
        return super.canActivate(context);
    }

    // On ne lève jamais d'erreur : si pas de token ou token invalide,
    // la requête passe quand même avec req.user = undefined.
    handleRequest(_err: any, user: any) {
        return user || null;
    }
}
