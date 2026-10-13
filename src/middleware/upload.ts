import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';
import { env } from '../config/env';
import { badRequest } from '../utils/errors';

const dir = path.resolve(process.cwd(), env.UPLOAD_DIR);
fs.mkdirSync(dir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, dir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!/^image\/(png|jpe?g|webp|gif)$/.test(file.mimetype)) {
      return cb(badRequest('Only image files are allowed'));
    }
    cb(null, true);
  },
});

export const uploadDir = dir;