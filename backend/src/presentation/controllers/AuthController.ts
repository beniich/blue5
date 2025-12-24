import { Request, Response } from 'express';
import { LoginUseCase } from '@application/use-cases/auth/LoginUseCase';
import { PrismaUserRepository } from '@infrastructure/database/PrismaUserRepository';
import prisma from '@infrastructure/database/prisma';
import { z } from 'zod';

const loginSchema = z.object({
    email: z.string().email('Email invalide'),
    password: z.string().min(6, 'Mot de passe requis'),
});

export class AuthController {
    async login(req: Request, res: Response): Promise<void> {
        try {
            // Validate input
            const { email, password } = loginSchema.parse(req.body);

            // Execute use case
            const userRepository = new PrismaUserRepository(prisma);
            const loginUseCase = new LoginUseCase(userRepository);
            const result = await loginUseCase.execute(email, password);

            res.json(result);
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ error: error.errors });
                return;
            }
            res.status(401).json({ error: error.message });
        }
    }

    async logout(req: Request, res: Response): Promise<void> {
        // TODO: Implement session invalidation
        res.json({ message: 'Déconnexion réussie' });
    }

    async refresh(req: Request, res: Response): Promise<void> {
        // TODO: Implement token refresh
        res.json({ message: 'Token rafraîchi' });
    }
}
