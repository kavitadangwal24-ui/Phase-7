
import { GoogleGenerativeAI } from "@google/generative-ai";
import Project from "../models/Project.js";

export const askGemini = async (req, res) => {
  try {
    const { projectId, prompt, action } = req.body;

    
    if (!projectId || !prompt || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        message: "Project ID and prompt are required.",
      });
    }

    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "Gemini API key is not configured.",
      });
    }

    // Verify project access
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

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(
      process.env.GEMINI_API_KEY
    );

    const model = genAI.getGenerativeModel({
      model: "gemini-3.8-flash",
    });

    // AI action instructions
    let instruction = "Help the developer with this request:";

    if (action === "explain") {
      instruction =
        "Explain the following code or text clearly with examples:";
    } else if (action === "improve") {
      instruction =
        "Improve the following code or content and suggest better practices:";
    } else if (action === "documentation") {
      instruction =
        "Generate clear and professional technical documentation:";
    } else if (action === "readme") {
      instruction =
        "Generate a professional README.md for the following project details:";
    }

    
    let result;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        result = await model.generateContent(
          `${instruction}\n\n${prompt}`
        );

        break;
      } catch (error) {
        const status =
          error.status || error.response?.status;

        if (attempt === 3 || ![429, 503].includes(status)) {
          throw error;
        }

        console.log(
          `Gemini busy. Retrying attempt ${attempt + 1}...`
        );

        await new Promise((resolve) =>
          setTimeout(resolve, attempt * 3000)
        );
      }
    }

   
    return res.status(200).json({
      success: true,
      message: "Gemini response generated successfully.",
      response: result.response.text(),
    });

  } catch (error) {
    console.error("Gemini AI Error:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message || "Failed to generate AI response.",
    });
  }
};
