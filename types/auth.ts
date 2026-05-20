import type { Request } from 'express';

export type AuthUser = { id: number; email: string; role: 'USER' | 'ADMIN' };

export type AuthRequest = Request & { user: AuthUser };
