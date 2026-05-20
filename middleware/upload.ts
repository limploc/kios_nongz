import crypto from 'crypto';
import fs from 'fs';
import multer from 'multer';
import path from 'path';

const uploadDir = process.env.UPLOAD_DIR || 'uploads';
const maxSizeMb = process.env.UPLOAD_MAX_SIZE_MB
  ? Number(process.env.UPLOAD_MAX_SIZE_MB)
  : 5;

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '');
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (!file.mimetype.startsWith('image/')) {
    cb(new Error('Invalid file type'));
    return;
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxSizeMb * 1024 * 1024 },
});

export default upload;
