import prisma from '@infrastructure/database/prisma';
import { StorageService } from '@infrastructure/storage/StorageService';
import * as crypto from 'crypto';

interface UploadDocumentDTO {
    file: Buffer;
    filename: string;
    mimeType: string;
    size: number;
    folderId?: string;
    tags?: string[];
    userId: string;
}

export class UploadDocumentUseCase {
    private storageService = new StorageService();

    async execute(dto: UploadDocumentDTO): Promise<any> {
        // Upload to storage
        const { path: filePath, publicUrl } = await this.storageService.uploadFile(
            dto.file,
            dto.filename,
            dto.mimeType,
            dto.userId
        );

        // Create document record
        const document = await prisma.document.create({
            data: {
                name: dto.filename,
                originalName: dto.filename,
                mimeType: dto.mimeType,
                size: dto.size,
                path: filePath,
                folderId: dto.folderId,
                tags: dto.tags || [],
                uploadedBy: dto.userId,
                versions: {
                    create: {
                        version: 1,
                        path: filePath,
                        size: dto.size,
                        createdBy: dto.userId,
                    },
                },
                activities: {
                    create: {
                        action: 'UPLOAD',
                        userId: dto.userId,
                        details: {
                            filename: dto.filename,
                            size: dto.size,
                        },
                    },
                },
            },
            include: {
                folder: true,
                versions: true,
            },
        });

        return document;
    }
}
