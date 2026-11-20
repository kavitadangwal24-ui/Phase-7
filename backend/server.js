
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import notesRoutes from "./routes/notesRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import geminiRoutes from "./routes/geminiRoutes.js";
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/gemini", geminiRoutes);
// Test Route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to CollabSphere API 🚀",
  });
});

// Server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    if (
      process.env.MONGO_URI &&
      process.env.MONGO_URI !== "your_mongodb_connection_string"
    ) {
      await connectDB();
    } else {
      console.log("MongoDB URI not configured yet.");
    }

    app.listen(PORT, () => {
      console.log(`CollabSphere Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server Error:", error.message);
    process.exit(1);
  }
};

startServer();
