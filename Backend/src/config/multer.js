import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = "uploads/";

    // Prefer explicit uploadType set by route middleware (reliable for multipart)
    if (req.uploadType === 'avatar') {
      folder += "avatars";
    } else {
      // Fallback: Use fileType from body or default to messages for chat media
      const fileType = req.body?.fileType || 'CHAT_MEDIA';
      switch (fileType) {
        case "PROFILE_PICTURE":
          folder += "avatars";
          break;
        case "CHAT_MEDIA":
          folder += "messages";
          break;
        case "CERTIFICATION":
          folder += "certifications";
          break;
        case "MEDICAL_DOCUMENT":
          folder += "medical-records";
          break;
        case "CONSULTATION_RECORDING":
          folder += "consultation-recordings";
          break;
        default:
          folder += "others";
      }
    }

    // Ensure destination exists
    try {
      fs.mkdirSync(folder, { recursive: true });
    } catch (_) {}

    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
});

export { upload };
