
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  FileText,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Sparkles,
  Lightbulb,
  Loader,
} from "lucide-react";

import MDEditor from "@uiw/react-md-editor";
import API from "../services/api";

import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

function Notes() {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("projectId");

  const [notes, setNotes] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(projectId || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });

  const [aiLoading, setAiLoading] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [aiError, setAiError] = useState("");

  const fetchProjects = async () => {
    try {
      const response = await API.get("/projects");
      const projectList = response.data.projects || [];

      setProjects(projectList);

      if (!selectedProject && projectList.length > 0) {
        setSelectedProject(projectList[0]._id);
      }
    } catch (err) {
      setError("Failed to load projects.");
    }
  };

  const fetchNotes = async () => {
    if (!selectedProject) {
      setNotes([]);
      return;
    }

    setLoading(true);

    try {
      const response = await API.get(
        `/notes/project/${selectedProject}`
      );

      setNotes(response.data.notes || []);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load notes."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [selectedProject]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (editingId) {
        await API.put(`/notes/${editingId}`, formData);
      } else {
        await API.post("/notes", {
          ...formData,
          projectId: selectedProject,
        });
      }

      setFormData({ title: "", content: "" });
      setEditingId(null);
      setShowForm(false);
      setAiResponse("");
      setAiError("");

      await fetchNotes();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to save note."
      );
    }
  };

  const handleEdit = (note) => {
    setFormData({
      title: note.title,
      content: note.content || "",
    });

    setEditingId(note._id);
    setShowForm(true);
    setAiResponse("");
    setAiError("");
  };

  const handleDelete = async (noteId) => {
    if (!window.confirm("Delete this note?")) return;

    try {
      await API.delete(`/notes/${noteId}`);
      await fetchNotes();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to delete note."
      );
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ title: "", content: "" });
    setAiResponse("");
    setAiError("");
  };

  const handleNewNote = () => {
    setEditingId(null);
    setFormData({ title: "", content: "" });
    setAiResponse("");
    setAiError("");
    setShowForm(true);
  };

  // Gemini AI actions
  const handleGemini = async (action) => {
    if (!selectedProject) {
      setAiError("Please select a project first.");
      return;
    }

    if (!formData.content.trim()) {
      setAiError("Please write some note content first.");
      return;
    }

    setAiLoading(action);
    setAiResponse("");
    setAiError("");

    try {
      const response = await API.post("/gemini/ask", {
        projectId: selectedProject,
        prompt: `Note Title: ${formData.title}\n\nNote Content:\n${formData.content}`,
        action,
      });

      setAiResponse(response.data.response);
    } catch (err) {
      setAiError(
        err.response?.data?.message ||
          "Failed to generate AI response."
      );
    } finally {
      setAiLoading("");
    }
  };

  return (
    <div className="notes-page">
      <header className="notes-header">
        <div>
          <p>Workspace</p>
          <h1>Project Notes</h1>
          <span>Organize your ideas and development notes.</span>
        </div>

        <button
          className="notes-create-btn"
          onClick={handleNewNote}
          disabled={!selectedProject}
        >
          <Plus size={18} /> New Note
        </button>
      </header>

      <div className="notes-project-select">
        <label>Select Project</label>

        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
        >
          <option value="">Choose a project</option>

          {projects.map((project) => (
            <option key={project._id} value={project._id}>
              {project.title}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="notes-error">{error}</p>}

      {showForm && (
        <form className="notes-form" onSubmit={handleSubmit}>
          <div className="notes-form-heading">
            <h2>{editingId ? "Edit Note" : "Create New Note"}</h2>

            <button type="button" onClick={closeForm}>
              <X size={20} />
            </button>
          </div>

          <input
            type="text"
            name="title"
            placeholder="Note title"
            value={formData.title}
            onChange={handleChange}
            required
          />

          <div className="notes-markdown-editor">
            <label>Write your note using Markdown</label>

            <div data-color-mode="light">
              <MDEditor
                value={formData.content}
                onChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    content: value || "",
                  }))
                }
                height={280}
                preview="live"
              />
            </div>
          </div>

          <div className="notes-ai-buttons">
            <button
              type="button"
              onClick={() => handleGemini("explain")}
              disabled={!!aiLoading || !formData.content.trim()}
            >
              {aiLoading === "explain" ? (
                <Loader size={17} />
              ) : (
                <Sparkles size={17} />
              )}
              Explain This Note
            </button>

            <button
              type="button"
              onClick={() => handleGemini("improve")}
              disabled={!!aiLoading || !formData.content.trim()}
            >
              {aiLoading === "improve" ? (
                <Loader size={17} />
              ) : (
                <Lightbulb size={17} />
              )}
              Suggest Improvements
            </button>
          </div>

          {aiError && (
            <p className="notes-error">{aiError}</p>
          )}

          {aiResponse && (
            <div className="notes-ai-response">
              <h3>
                <Sparkles size={19} />
                Gemini AI Response
              </h3>

              <div data-color-mode="light">
                <MDEditor.Markdown source={aiResponse} />
              </div>
            </div>
          )}

          <button type="submit">
            <Save size={17} />
            {editingId ? "Update Note" : "Save Note"}
          </button>
        </form>
      )}

      {loading ? (
        <p>Loading notes...</p>
      ) : notes.length === 0 ? (
        <div className="notes-empty">
          <FileText size={40} />
          <h2>No notes yet</h2>
          <p>Create your first note for this project.</p>
        </div>
      ) : (
        <div className="notes-grid">
          {notes.map((note) => (
            <div className="note-card" key={note._id}>
              <div className="note-card-heading">
                <FileText size={21} />

                <div>
                  <button onClick={() => handleEdit(note)}>
                    <Pencil size={17} />
                  </button>

                  <button onClick={() => handleDelete(note._id)}>
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>

              <h3>{note.title}</h3>

              <div className="note-card-content" data-color-mode="light">
                <MDEditor.Markdown
                  source={note.content || "No content added."}
                />
              </div>

              <span>
                {new Date(note.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Notes;
