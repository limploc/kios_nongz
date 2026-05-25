import fs from 'fs/promises';
import path from 'path';
import prisma from '../config/prisma.js';
import { createError } from '../utils/errors.js';

type CreateUploadOptions = {
  folder?: string;
};

const getSupabaseConfig = () => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
  const supabaseBucket = process.env.SUPABASE_BUCKET;

  if (!supabaseUrl || !supabaseServiceKey || !supabaseBucket) {
    throw createError(
      'Supabase storage is not configured. Set SUPABASE_URL, SUPABASE_SERVICE_KEY, and SUPABASE_BUCKET.',
      500
    );
  }

  return { supabaseUrl, supabaseServiceKey, supabaseBucket };
};

const buildObjectPath = (folder: string, fileName: string) => {
  const normalizedFolder = folder.replace(/^\/+|\/+$/g, '');
  const normalizedName = fileName.replace(/^\/+/, '');

  if (!normalizedFolder) {
    return normalizedName;
  }

  return `${normalizedFolder}/${normalizedName}`;
};

const encodeObjectPath = (objectPath: string) =>
  objectPath
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');

const uploadToSupabase = async (file: Express.Multer.File, folder: string) => {
  const { supabaseUrl, supabaseServiceKey, supabaseBucket } = getSupabaseConfig();
  const objectPath = buildObjectPath(folder, file.filename || path.basename(file.path));
  const encodedObjectPath = encodeObjectPath(objectPath);
  const fileBuffer = await fs.readFile(file.path);

  try {
    const response = await fetch(
      `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/${supabaseBucket}/${encodedObjectPath}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${supabaseServiceKey}`,
          apikey: `${supabaseServiceKey}`,
          'Content-Type': file.mimetype,
          'x-upsert': 'true',
        },
        body: fileBuffer,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw createError(
        `Failed to upload file to Supabase: ${response.status} ${errorText}`,
        500
      );
    }

    return {
      url: `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/public/${supabaseBucket}/${encodedObjectPath}`,
      objectPath,
    };
  } finally {
    await fs.unlink(file.path).catch(() => undefined);
  }
};

export const createUpload = async (
  userId: number | null,
  file: Express.Multer.File,
  options: CreateUploadOptions = {}
) => {
  const uploadResult = await uploadToSupabase(file, options.folder ?? 'uploads');

  const upload = await prisma.upload.create({
    data: {
      userId: userId ?? null,
      url: uploadResult.url,
      path: uploadResult.objectPath,
      mimeType: file.mimetype,
      size: file.size,
    },
  });

  return { url: upload.url };
};
