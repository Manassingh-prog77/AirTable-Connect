import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "..", "uploads");
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ts = Date.now();
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${ts}-${safe}`);
  }
});

const upload = multer({ storage });
const router = Router();

router.post("/", upload.array("files", 5), (req, res) => {
  const host = process.env.PUBLIC_URL || `http://localhost:${process.env.PORT || 4000}`;
  const urls = (req.files || []).map(f => `${host}/uploads/${path.basename(f.path)}`);
  res.json({ urls });
});

export default router;
