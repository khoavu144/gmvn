import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const BUCKET_NAME = 'gymerviet_assets';
let supabase: any = null;

const getSupabase = () => {
    if (supabase) return supabase;
    const url = process.env.SUPABASE_URL || '';
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (!url || url.includes('your_supabase_url_here') || !key || key.includes('your_supabase_key_here')) {
        throw new Error('Supabase Storage is not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
    }

    supabase = createClient(url, key);
    return supabase;
};

export const uploadFileToSupabase = async (
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string,
    folder: string = 'uploads'
): Promise<string> => {
    try {
        const client = getSupabase();
        const fileExtension = originalName.split('.').pop() || 'jpg';
        const fileName = `${folder}/${uuidv4()}.${fileExtension}`;

        const { data, error } = await client.storage
            .from(BUCKET_NAME)
            .upload(fileName, fileBuffer, {
                contentType: mimeType,
                upsert: false,
            });

        if (error) {
            console.error('Supabase upload error details:', error);
            throw new Error(`Failed to upload file to Supabase: ${error.message}`);
        }

        // Get public URL
        const { data: { publicUrl } } = client.storage
            .from(BUCKET_NAME)
            .getPublicUrl(fileName);

        return publicUrl;
    } catch (error) {
        console.error('File upload error:', error);
        throw error;
    }
};
