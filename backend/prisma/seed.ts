import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seed...');

    // Create Admin Role
    const adminRole = await prisma.role.upsert({
        where: { name: 'Admin' },
        update: {},
        create: {
            name: 'Admin',
            description: 'Administrateur système avec tous les droits',
            isSystem: true,
        },
    });

    // Create Teacher Role
    const teacherRole = await prisma.role.upsert({
        where: { name: 'Teacher' },
        update: {},
        create: {
            name: 'Teacher',
            description: 'Enseignant',
            isSystem: true,
        },
    });

    // Create Student Role
    const studentRole = await prisma.role.upsert({
        where: { name: 'Student' },
        update: {},
        create: {
            name: 'Student',
            description: 'Élève',
            isSystem: true,
        },
    });

    // Create Parent Role
    const parentRole = await prisma.role.upsert({
        where: { name: 'Parent' },
        update: {},
        create: {
            name: 'Parent',
            description: 'Parent d\'élève',
            isSystem: true,
        },
    });

    // Create Admin User
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@school1cc.com' },
        update: {},
        create: {
            email: 'admin@school1cc.com',
            password: hashedPassword,
            firstName: 'Super',
            lastName: 'Admin',
            phone: '+221123456789',
            isActive: true,
            emailVerified: true,
            roleId: adminRole.id,
        },
    });

    // Create Permissions
    const permissions = [
        { name: 'users.view', description: 'Voir les utilisateurs', module: 'users', action: 'view' },
        { name: 'users.create', description: 'Créer des utilisateurs', module: 'users', action: 'create' },
        { name: 'users.edit', description: 'Modifier des utilisateurs', module: 'users', action: 'edit' },
        { name: 'users.delete', description: 'Supprimer des utilisateurs', module: 'users', action: 'delete' },
        { name: 'settings.view', description: 'Voir les paramètres', module: 'settings', action: 'view' },
        { name: 'settings.edit', description: 'Modifier les paramètres', module: 'settings', action: 'edit' },
    ];

    for (const perm of permissions) {
        await prisma.permission.upsert({
            where: { name: perm.name },
            update: {},
            create: perm,
        });
    }

    // Create Default Settings
    await prisma.setting.upsert({
        where: { key: 'app.name' },
        update: {},
        create: {
            key: 'app.name',
            value: 'School 1cc',
            description: 'Nom de l\'application',
            isSystem: true,
        },
    });

    await prisma.setting.upsert({
        where: { key: 'app.language' },
        update: {},
        create: {
            key: 'app.language',
            value: 'fr',
            description: 'Langue par défaut',
            isSystem: false,
        },
    });

    console.log('✅ Seed completed!');
    console.log(`📧 Admin user: admin@school1cc.com / Admin@123`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
