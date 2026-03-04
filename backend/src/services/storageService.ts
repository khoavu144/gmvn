import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''; // Use service role key for backend operations

if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️ SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing. Storage feature might not work.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

const BUCKET_NAME = 'gymerviet_assets'; // Ensure this bucket is created in Supabase!

export const uploadFileToSupabase = async (
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string,
    folder: string = 'uploads'
): Promise<string> => {
    try {
        const fileExtension = originalName.split('.').pop() || 'jpg';
        const fileName = `${folder}/${uuidv4()}.${fileExtension}`;

        const { data, error } = await supabase.storage
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
        const { data: { publicUrl } } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(fileName);

        return publicUrl;
    } catch (error) {
        console.error('File upload error:', error);
        throw error;
    }
};
