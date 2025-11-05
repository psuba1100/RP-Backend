import multer from "multer";

function fileFilter(req, file, cb) {
  const allowedExts = /jpeg|jpg|png|webp|gif/;
  const ext = file.originalname.toLowerCase().match(/\.(jpeg|jpg|png|webp|gif)$/);
  if (!ext) return cb(new Error("Unsupported file type"), false);
  cb(null, true);
}

export const upload = multer({
  storage: multer.memoryStorage(), // file kept in memory
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});