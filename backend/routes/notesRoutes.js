
import express from "express";

import {
  createNote,
  getNotes,
  updateNote,
  deleteNote,
} from "../controllers/notesController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Protect all notes routes
router.use(authMiddleware);

// Create note
router.post("/", createNote);

// Get notes of a project
router.get("/project/:projectId", getNotes);

// Update note
router.put("/:noteId", updateNote);

// Delete note
router.delete("/:noteId", deleteNote);

export default router;
