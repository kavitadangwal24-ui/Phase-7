
import multer from "multer";
import path from "path";
import fs from "fs";
import File from "../models/File.js";
import Project from "../models/Project.js";

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9);

    cb(null, uniqueName + path.extname(file.originalname));
  },
});

// File upload configuration
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

// Upload file
export const uploadFile = async (req, res) => {
  try {
    const { projectId } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select a file.",
      });
    }

    const project = await Project.findOne({
      _id: projectId,
      members: req.user.id,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found or access denied.",
      });
    }

    const newFile = await File.create({
      originalName: req.file.originalname,
      fileName: req.file.filename,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      project: projectId,
      uploadedBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "File uploaded successfully.",
      file: newFile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get project files
export const getProjectFiles = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findOne({
      _id: projectId,
      members: req.user.id,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found or access denied.",
      });
    }

    const files = await File.find({
      project: projectId,
    })
      .populate("uploadedBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      files,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Preview / access uploaded file
export const previewFile = async (req, res) => {
  try {
    const { fileId } = req.params;

    const file = await File.findById(fileId);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found.",
      });
    }

    // Check project membership
    const project = await Project.findOne({
      _id: file.project,
      members: req.user.id,
    });

    if (!project) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this file.",
      });
    }

    // Resolve the stored file path
    const absolutePath = path.resolve(file.filePath);

    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({
        success: false,
        message: "File is missing from the server.",
      });
    }

    const safeName = path
      .basename(file.originalName)
      .replace(/["\r\n]/g, "");

    res.setHeader("Content-Type", file.mimeType);
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${safeName}"`
    );

    res.sendFile(absolutePath, (error) => {
      if (error && !res.headersSent) {
        res.status(500).json({
          success: false,
          message: "Unable to preview this file.",
        });
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export { upload };
