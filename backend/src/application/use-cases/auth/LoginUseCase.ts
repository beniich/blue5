import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { IUserRepository } from '@domain/repositories/IUserRepository';

export class LoginUseCase {
    constructor(private userRepository: IUserRepository) { }

    async execute(email: string, password: string): Promise<{ token: string; user: any }> {
        // Find user
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new Error('Email ou mot de passe incorrect');
        }

        // Check if user is active
        if (!user.isActive) {
            throw new Error('Compte désactivé');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Email ou mot de passe incorrect');
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email, roleId: user.roleId },
            process.env.JWT_SECRET!,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        // Return token and user info (without password)
        const { password: _, ...userWithoutPassword } = user;
        return { token, user: userWithoutPassword };
    }
}
