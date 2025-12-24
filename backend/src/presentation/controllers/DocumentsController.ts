import { Request, Response } from 'express';
import { UploadDocumentUseCase } from '@application/use-cases/documents/UploadDocumentUseCase';
import prisma from '@infrastructure/database/prisma';
import { AuthRequest } from '@presentation/middlewares/auth.middleware';

export class DocumentsController {
    async upload(req: AuthRequest, res: Response): Promise<void> {
        try {
            // TODO: Implement multipart/form-data parsing (multer)
            // For now, this is a skeleton
            const uploadUseCase = new UploadDocumentUseCase();

            res.status(501).json({ error: 'Upload endpoint à implémenter avec multer' });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async list(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { folderId, search, archived } = req.query;

            const documents = await prisma.document.findMany({
                where: {
                    ...(folderId && { folderId: folderId as string }),
                    ...(archived === 'true' && { isArchived: true }),
                    ...(search && {
                        OR: [
                            { name: { contains: search as string, mode: 'insensitive' } },
                            { tags: { has: search as string } },
                        ],
                    }),
                },
                include: {
                    folder: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });

            res.json(documents);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async createFolder(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { name, parentId } = req.body;
            const userId = req.user!.id;

            const folder = await prisma.folder.create({
                data: {
                    name,
                    parentId,
                    path: parentId ? `${parentId}/${name}` : `/${name}`,
                    createdBy: userId,
                },
            });

            res.json(folder);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async delete(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            await prisma.document.update({
                where: { id },
                data: { isArchived: true },
            });

            res.json({ message: 'Document archivé' });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}
