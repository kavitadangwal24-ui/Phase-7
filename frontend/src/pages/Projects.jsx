
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FolderKanban,
  Plus,
  Trash2,
  Users,
  ArrowUpRight,
  X,
} from "lucide-react";
import API from "../services/api";

function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  const fetchProjects = async () => {
    try {
      const response = await API.get("/projects");
      setProjects(response.data.projects || []);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load projects."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await API.post("/projects", formData);

      setFormData({ title: "", description: "" });
      setShowForm(false);

      await fetchProjects();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to create project."
      );
    }
  };

  const handleDelete = async (projectId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (!confirmed) return;

    try {
      await API.delete(`/projects/${projectId}`);
      await fetchProjects();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to delete project."
      );
    }
  };

  return (
    <div className="projects-page">
      <header className="projects-header">
        <div>
          <p>Workspace</p>
          <h1>My Projects</h1>
          <span>Manage your development projects in one place.</span>
        </div>

        <button
          className="projects-create-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? <X size={18} /> : <Plus size={18} />}
          {showForm ? "Close" : "Create Project"}
        </button>
      </header>

      {error && <p className="projects-error">{error}</p>}

      {showForm && (
        <form className="projects-form" onSubmit={handleCreate}>
          <h2>Create New Project</h2>

          <input
            type="text"
            name="title"
            placeholder="Project title"
            value={formData.title}
            onChange={handleChange}
            required
          />

          <textarea
            name="description"
            placeholder="Project description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
          />

          <button type="submit">Create Project</button>
        </form>
      )}

      {loading ? (
        <p>Loading projects...</p>
      ) : projects.length === 0 ? (
        <div className="projects-empty">
          <FolderKanban size={42} />
          <h2>No projects found</h2>
          <p>Create your first project to get started.</p>
          <button onClick={() => setShowForm(true)}>
            <Plus size={17} /> Create Project
          </button>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map((project) => (
            <div className="project-card" key={project._id}>
              <div className="project-card-top">
                <div className="project-card-icon">
                  <FolderKanban size={22} />
                </div>

                <button
                  className="project-delete-btn"
                  onClick={() => handleDelete(project._id)}
                  title="Delete project"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <h3>{project.title}</h3>
              <p>
                {project.description || "No description available."}
              </p>

              <div className="project-card-footer">
                <span>
                  <Users size={16} />
                  {project.members?.length || 0} Members
                </span>

                <Link to={`/projects/${project._id}`}>
                  Open <ArrowUpRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Projects;
