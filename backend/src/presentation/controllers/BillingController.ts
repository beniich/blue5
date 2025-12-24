import { Request, Response } from 'express';
import { CreateInvoiceUseCase } from '@application/use-cases/billing/CreateInvoiceUseCase';
import prisma from '@infrastructure/database/prisma';
import { AuthRequest } from '@presentation/middlewares/auth.middleware';

export class BillingController {
    async createInvoice(req: AuthRequest, res: Response): Promise<void> {
        try {
            const useCase = new CreateInvoiceUseCase();
            const invoice = await useCase.execute({
                ...req.body,
                createdBy: req.user!.id,
                dueDate: new Date(req.body.dueDate),
            });
            res.status(201).json(invoice);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async listInvoices(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { status, studentId, startDate, endDate } = req.query;

            const invoices = await prisma.invoice.findMany({
                where: {
                    ...(status && { status: status as any }),
                    ...(studentId && { studentId: studentId as string }),
                    ...(startDate && endDate && {
                        issueDate: {
                            gte: new Date(startDate as string),
                            lte: new Date(endDate as string),
                        },
                    }),
                },
                include: {
                    items: true,
                    payments: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });

            res.json(invoices);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getStats(req: AuthRequest, res: Response): Promise<void> {
        try {
            // TODO: Implement advanced aggregation
            const stats = {
                totalRevenue: 0,
                pendingAmount: 0,
                overdueCount: 0,
            };

            const invoices = await prisma.invoice.findMany();

            stats.totalRevenue = invoices
                .filter(i => i.status === 'PAID' || i.status === 'PARTIALLY_PAID')
                .reduce((sum, i) => sum + Number(i.total) - Number(i.balance), 0);

            stats.pendingAmount = invoices
                .reduce((sum, i) => sum + Number(i.balance), 0);

            stats.overdueCount = invoices
                .filter(i => i.status === 'OVERDUE').length;

            res.json(stats);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}
