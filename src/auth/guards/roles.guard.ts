import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../shared/enums/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRole = this.reflector.getAllAndOverride<Role>('role', [
            context.getHandler(),
        ])
        const req = context.switchToHttp().getRequest();
        
        if (!requiredRole) {
            return true;
        }
        
        return requiredRole == req.user?.role;
    }
}