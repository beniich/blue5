import prisma from '@infrastructure/database/prisma';
import { InvoiceStatus } from '@prisma/client';

interface CreateInvoiceDTO {
    studentId: string;
    parentId?: string;
    items: {
        productId?: string;
        description: string;
        quantity: number;
        unitPrice: number;
    }[];
    dueDate: Date;
    notes?: string;
    createdBy: string;
}

export class CreateInvoiceUseCase {
    async execute(dto: CreateInvoiceDTO): Promise<any> {
        // Calculate totals
        let subtotal = 0;
        const itemsData = dto.items.map(item => {
            const total = item.quantity * item.unitPrice;
            subtotal += total;
            return {
                ...item,
                total,
            };
        });

        const taxTotal = 0; // TODO: Add tax logic
        const discountTotal = 0; // TODO: Add discount logic
        const total = subtotal + taxTotal - discountTotal;

        // Generate invoice number
        const year = new Date().getFullYear();
        const count = await prisma.invoice.count({
            where: {
                createdAt: {
                    gte: new Date(year, 0, 1),
                    lt: new Date(year + 1, 0, 1),
                },
            },
        });
        const number = `INV-${year}-${(count + 1).toString().padStart(4, '0')}`;

        // Create invoice
        const invoice = await prisma.invoice.create({
            data: {
                number,
                studentId: dto.studentId,
                parentId: dto.parentId,
                subtotal,
                taxTotal,
                discountTotal,
                total,
                balance: total, // Initially balance = total
                status: InvoiceStatus.DRAFT,
                dueDate: dto.dueDate,
                notes: dto.notes,
                createdBy: dto.createdBy,
                items: {
                    create: itemsData,
                },
            },
            include: {
                items: true,
            },
        });

        return invoice;
    }
}
