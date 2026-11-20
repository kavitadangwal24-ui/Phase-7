
import Note from "../models/Note.js";
import Project from "../models/Project.js";

// CREATE NOTE
export const createNote = async (req, res) => {
  try {
    const { title, content, projectId } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({
        success: false,
        message: "Title and project ID are required",
      });
    }

    const project = await Project.findOne({
      _id: projectId,
      members: req.user.id,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found or access denied",
      });
    }

    const note = await Note.create({
      title,
      content: content || "",
      project: projectId,
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Note created successfully",
      note,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET PROJECT NOTES
export const getNotes = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findOne({
      _id: projectId,
      members: req.user.id,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found or access denied",
      });
    }

    const notes = await Note.find({
      project: projectId,
    })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notes.length,
      notes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE NOTE
export const updateNote = async (req, res) => {
  try {
    const { title, content } = req.body;

    const note = await Note.findById(req.params.noteId);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    const project = await Project.findOne({
      _id: note.project,
      members: req.user.id,
    });

    if (!project) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;

    await note.save();

    res.status(200).json({
      success: true,
      message: "Note updated successfully",
      note,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE NOTE
export const deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.noteId);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    const project = await Project.findOne({
      _id: note.project,
      members: req.user.id,
    });

    if (!project) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    await note.deleteOne();

    res.status(200).json({
      success: true,
      message: "Note deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
