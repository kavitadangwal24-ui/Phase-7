
import express from "express";

import { askGemini } from "../controllers/geminiController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

// Generate AI response
router.post("/ask", askGemini);

export default router;
