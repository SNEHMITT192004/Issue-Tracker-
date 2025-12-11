import multer from "multer";
import path from "path";

// storage settings
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

// file filter (allow images/documents)
const fileFilter = (req, file, cb) => {
  const allowed = ["image/png", "image/jpeg", "image/jpg", "application/pdf"];

  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("File type not allowed"), false);
};

export default multer({ storage, fileFilter });
