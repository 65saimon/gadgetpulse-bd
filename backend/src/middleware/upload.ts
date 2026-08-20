import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { ENV } from '../config/env';

// Ensure upload directories exist
const uploadDir = ENV.UPLOAD_DIR;
const membersUploadDir = path.join(uploadDir, 'members');
const cameraUploadDir = path.join(uploadDir, 'camera');

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
if (!fs.existsSync(membersUploadDir)) fs.mkdirSync(membersUploadDir, { recursive: true });
if (!fs.existsSync(cameraUploadDir)) fs.mkdirSync(cameraUploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'cameraImage') {
      cb(null, cameraUploadDir);
    } else {
      cb(null, membersUploadDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and WebP image files are allowed.'));
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter,
});
