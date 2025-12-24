import prisma from '@infrastructure/database/prisma';

export class GetSettingsUseCase {
    async execute(key?: string): Promise<any> {
        if (key) {
            const setting = await prisma.setting.findUnique({
                where: { key }
            });
            return setting;
        }

        const settings = await prisma.setting.findMany();
        return settings.reduce((acc, setting) => {
            acc[setting.key] = setting.value;
            return acc;
        }, {} as Record<string, any>);
    }
}
