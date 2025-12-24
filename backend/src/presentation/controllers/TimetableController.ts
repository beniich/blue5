import { Request, Response } from 'express';
import { GetTimetableUseCase } from '@application/use-cases/timetable/GetTimetableUseCase';
import prisma from '@infrastructure/database/prisma';
import { AuthRequest } from '@presentation/middlewares/auth.middleware';

export class TimetableController {
    async getTimetable(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { classId, teacherId, roomId } = req.query;

            const useCase = new GetTimetableUseCase();
            const timetable = await useCase.execute({
                classId: classId as string,
                teacherId: teacherId as string,
                roomId: roomId as string,
            });

            res.json(timetable);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async createSession(req: AuthRequest, res: Response): Promise<void> {
        try {
            // Basic creation logic directly in controller for brevity
            const session = await prisma.timetableSession.create({
                data: req.body,
                include: {
                    course: true,
                    room: true,
                    timeSlot: true,
                }
            });
            res.status(201).json(session);
        } catch (error: any) {
            if (error.code === 'P2002') { // Unique constraint violation
                res.status(409).json({ error: 'Conflit: Une session existe déjà pour ce créneau.' });
                return;
            }
            res.status(500).json({ error: error.message });
        }
    }
}
