
import Project from "../models/Project.js";
import User from "../models/User.js";
import Note from "../models/Note.js";
import File from "../models/File.js";

// CREATE PROJECT
export const createProject = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Project title is required",
      });
    }

    const project = await Project.create({
      title: title.trim(),
      description: description || "",
      owner: req.user.id,
      members: [req.user.id],
    });

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET ALL USER PROJECTS
export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      members: req.user.id,
    })
      .populate("owner", "name email")
      .populate("members", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ADD TEAM MEMBER
export const addMember = async (req, res) => {
  try {
    const { email } = req.body;
    const { projectId } = req.params;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Member email is required",
      });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Only project owner can add members
    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Only project owner can add members",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Ask them to register first.",
      });
    }

    if (
      project.members.some(
        (memberId) => memberId.toString() === user._id.toString()
      )
    ) {
      return res.status(409).json({
        success: false,
        message: "User is already a project member",
      });
    }

    project.members.push(user._id);
    await project.save();

    res.status(200).json({
      success: true,
      message: "Member added successfully",
      project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE PROJECT
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Only owner can delete
    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Only project owner can delete this project",
      });
    }

    await project.deleteOne();

    res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET PROJECT CONTRIBUTION ANALYTICS
export const getProjectAnalytics = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findOne({
      _id: projectId,
      members: req.user.id,
    }).populate("members", "name email");

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found or access denied.",
      });
    }

    const analytics = await Promise.all(
      project.members.map(async (member) => {
        const notesCreated = await Note.countDocuments({
          project: projectId,
          createdBy: member._id,
        });

        const filesUploaded = await File.countDocuments({
          project: projectId,
          uploadedBy: member._id,
        });

        return {
          userId: member._id,
          name: member.name,
          email: member.email,
          notesCreated,
          filesUploaded,
          totalContributions: notesCreated + filesUploaded,
        };
      })
    );

    const totalNotes = analytics.reduce(
      (sum, member) => sum + member.notesCreated,
      0
    );

    const totalFiles = analytics.reduce(
      (sum, member) => sum + member.filesUploaded,
      0
    );

    res.status(200).json({
      success: true,
      project: project.title,
      summary: {
        totalMembers: analytics.length,
        totalNotes,
        totalFiles,
        totalContributions: totalNotes + totalFiles,
      },
      contributions: analytics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
