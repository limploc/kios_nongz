import prisma from '../config/prisma.js';

export const createUpload = async (userId: number | null, file: Express.Multer.File) => {
  const baseUrl = process.env.UPLOAD_BASE_URL || '/uploads';
  const normalizedBase = baseUrl.endsWith('/')
    ? baseUrl.slice(0, -1)
    : baseUrl;
  const fileUrl = `${normalizedBase}/${file.filename}`;

  const upload = await prisma.upload.create({
    data: {
      userId: userId ?? null,
      url: fileUrl,
      path: file.path,
      mimeType: file.mimetype,
      size: file.size,
    },
  });

  return { url: upload.url };
};
