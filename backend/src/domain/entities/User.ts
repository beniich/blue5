// Domain Entity: User
export class User {
    constructor(
        public readonly id: string,
        public email: string,
        public password: string,
        public firstName: string,
        public lastName: string,
        public phone: string | null,
        public avatar: string | null,
        public isActive: boolean,
        public emailVerified: boolean,
        public roleId: string,
        public readonly createdAt: Date,
        public updatedAt: Date
    ) { }

    get fullName(): string {
        return `${this.firstName} ${this.lastName}`;
    }

    activate(): void {
        this.isActive = true;
        this.updatedAt = new Date();
    }

    deactivate(): void {
        this.isActive = false;
        this.updatedAt = new Date();
    }

    verifyEmail(): void {
        this.emailVerified = true;
        this.updatedAt = new Date();
    }

    updateProfile(data: Partial<Pick<User, 'firstName' | 'lastName' | 'phone' | 'avatar'>>): void {
        Object.assign(this, data);
        this.updatedAt = new Date();
    }
}
