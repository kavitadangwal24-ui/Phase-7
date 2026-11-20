
import express from "express";

import {
  createProject,
  getProjects,
  addMember,
  deleteProject,
} from "../controllers/projectController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Create project
router.post("/", createProject);

// Get all user projects
router.get("/", getProjects);

// Add team member
router.post("/:projectId/members", addMember);

// Delete project
router.delete("/:projectId", deleteProject);

export default router;
