import prisma from '@infrastructure/database/prisma';
import { DayOfWeek } from '@prisma/client';

interface TimetableFilter {
    classId?: string;
    teacherId?: string;
    roomId?: string;
}

export class GetTimetableUseCase {
    async execute(filter: TimetableFilter): Promise<any> {
        const where: any = {};

        if (filter.classId) where.classId = filter.classId;
        if (filter.teacherId) where.teacherId = filter.teacherId;
        if (filter.roomId) where.roomId = filter.roomId;

        const sessions = await prisma.timetableSession.findMany({
            where,
            include: {
                course: { include: { subject: true } },
                class: true,
                room: true,
                timeSlot: true,
            },
            orderBy: [
                { dayOfWeek: 'asc' },
                { timeSlot: { order: 'asc' } },
            ],
        });

        // Group by day for easier frontend consumption
        const grouped = sessions.reduce((acc: any, session) => {
            const day = session.dayOfWeek;
            if (!acc[day]) acc[day] = [];
            acc[day].push(session);
            return acc;
        }, {});

        return grouped;
    }
}
