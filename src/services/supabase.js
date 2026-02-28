// src/services/supabase.js
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const BUCKET = 'foro-archivos';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = [
    'image/png', 'image/jpeg', 'image/jpg', 'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

export const uploadForoFile = async (file) => {
    // Validate size
    if (file.size > MAX_FILE_SIZE) {
        throw new Error('El archivo excede el límite de 5MB');
    }

    // Validate type
    if (!ALLOWED_TYPES.includes(file.type)) {
        throw new Error('Tipo de archivo no permitido. Usa PNG, JPG, PDF o Word');
    }

    // Generate unique filename
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `${timestamp}_${safeName}`;

    const { data, error } = await supabase.storage
        .from(BUCKET)
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
        });

    if (error) {
        console.error('Supabase upload error:', error);
        throw new Error('Error al subir archivo: ' + error.message);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(data.path);

    return {
        url: urlData.publicUrl,
        nombre: file.name
    };
};

export const isImageFile = (nombre) => {
    if (!nombre) return false;
    const ext = nombre.toLowerCase().split('.').pop();
    return ['png', 'jpg', 'jpeg', 'webp'].includes(ext);
};

// --- DOCENTE FILE UPLOADS ---

const DOCENTE_BUCKET = 'docente-archivos';
const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
const DOCENTE_ALLOWED_TYPES = [
    ...IMAGE_TYPES,
    'application/pdf',
    'video/mp4', 'video/webm'
];
const DOCENTE_MAX_SIZE = 10 * 1024 * 1024; // 10MB

export const uploadDocenteFile = async (file) => {
    if (file.size > DOCENTE_MAX_SIZE) {
        throw new Error('El archivo excede el límite de 10MB');
    }

    if (!DOCENTE_ALLOWED_TYPES.includes(file.type)) {
        throw new Error('Tipo de archivo no permitido. Usa PNG, JPG, JPEG, WEBP, PDF o MP4');
    }

    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `${timestamp}_${safeName}`;

    const { data, error } = await supabase.storage
        .from(DOCENTE_BUCKET)
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
        });

    if (error) {
        console.error('Supabase upload error:', error);
        throw new Error('Error al subir archivo: ' + error.message);
    }

    const { data: urlData } = supabase.storage
        .from(DOCENTE_BUCKET)
        .getPublicUrl(data.path);

    return {
        url: urlData.publicUrl,
        nombre: file.name
    };
};

export default supabase;
