import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = "media/";

    switch (req.uploadType) {
      case "avatar":
        folder += "avatars";
        break;
      case "message":
        folder += "messages";
        break;
      case "certification":
        folder += "certifications";
        break;
      case "medical-record":
        folder += "medical-records";
        break;
      case "consultation-recording":
        folder += "consultation-recordings";
        break;
      default:
        folder += "others";
    }

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
