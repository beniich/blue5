import { Request, Response } from 'express';
import { SubmitGradesUseCase } from '@application/use-cases/grades/SubmitGradesUseCase';
import prisma from '@infrastructure/database/prisma';
import { AuthRequest } from '@presentation/middlewares/auth.middleware';

export class GradesController {
    async listExams(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { classId, termId } = req.query;

            const exams = await prisma.exam.findMany({
                where: {
                    ...(classId && { course: { classId: classId as string } }),
                    ...(termId && { termId: termId as string }),
                },
                include: {
                    course: {
                        include: { subject: true, class: true },
                    },
                    _count: {
                        select: { grades: true },
                    },
                },
                orderBy: { date: 'desc' },
            });

            res.json(exams);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async submitGrades(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { id } = req.params; // examId
            const { grades } = req.body;

            const useCase = new SubmitGradesUseCase();
            await useCase.execute(id, grades);

            res.json({ message: 'Notes enregistrées avec succès' });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getReportCard(req: AuthRequest, res: Response): Promise<void> {
        try {
            // TODO: Implement sophisticated report card generation logic
            // This is a placeholder for retrieving the report card data structure
            res.json({ message: 'Bulletin de notes (à implémenter)' });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}
