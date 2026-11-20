
import express from "express";

import {
  uploadFile,
  getProjectFiles,
  previewFile,
  upload,
} from "../controllers/fileController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

// Upload a file
router.post("/upload", upload.single("file"), uploadFile);

// Get all files of a project
router.get("/project/:projectId", getProjectFiles);

// Preview an uploaded file
router.get("/preview/:fileId", previewFile);

export default router;
