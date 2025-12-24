import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export class StorageService {
    private bucket = 'documents';

    async uploadFile(
        file: Buffer,
        filename: string,
        mimeType: string,
        userId: string
    ): Promise<{ path: string; publicUrl: string }> {
        const fileExt = path.extname(filename);
        const uniqueName = `${userId}/${Date.now()}_${crypto.randomBytes(8).toString('hex')}${fileExt}`;

        const { data, error } = await supabase.storage
            .from(this.bucket)
            .upload(uniqueName, file, {
                contentType: mimeType,
                upsert: false,
            });

        if (error) {
            throw new Error(`Upload failed: ${error.message}`);
        }

        const { data: { publicUrl } } = supabase.storage
            .from(this.bucket)
            .getPublicUrl(uniqueName);

        return { path: uniqueName, publicUrl };
    }

    async deleteFile(filePath: string): Promise<void> {
        const { error } = await supabase.storage
            .from(this.bucket)
            .remove([filePath]);

        if (error) {
            throw new Error(`Delete failed: ${error.message}`);
        }
    }

    async getDownloadUrl(filePath: string, expiresIn: number = 3600): Promise<string> {
        const { data, error } = await supabase.storage
            .from(this.bucket)
            .createSignedUrl(filePath, expiresIn);

        if (error) {
            throw new Error(`Failed to generate download URL: ${error.message}`);
        }

        return data.signedUrl;
    }
}
