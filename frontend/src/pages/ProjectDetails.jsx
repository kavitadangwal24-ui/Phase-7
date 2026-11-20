
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  FolderKanban,
  Users,
  FileText,
  Upload,
  Sparkles,
  UserPlus,
} from "lucide-react";
import API from "../services/api";

function ProjectDetails() {
  const { projectId } = useParams();

  const [project, setProject] = useState(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [addingMember, setAddingMember] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchProject = async () => {
    try {
      const response = await API.get("/projects");
      const allProjects = response.data.projects || [];

      const selectedProject = allProjects.find(
        (item) => item._id === projectId
      );

      if (!selectedProject) {
        setError("Project not found.");
        return;
      }

      setProject(selectedProject);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load project."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setAddingMember(true);

    try {
      const response = await API.post(
        `/projects/${projectId}/members`,
        { email }
      );

      setMessage(response.data.message || "Member added successfully.");
      setEmail("");
      await fetchProject();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to add team member."
      );
    } finally {
      setAddingMember(false);
    }
  };

  if (loading) {
    return <div className="project-details-page">Loading project...</div>;
  }

  if (!project) {
    return (
      <div className="project-details-page">
        <p>{error || "Project not found."}</p>
        <Link to="/projects">Back to Projects</Link>
      </div>
    );
  }

  return (
    <div className="project-details-page">
      <header className="project-details-header">
        <div className="project-details-icon">
          <FolderKanban size={28} />
        </div>

        <div>
          <p>Project Workspace</p>
          <h1>{project.title}</h1>
          <span>
            {project.description || "No project description available."}
          </span>
        </div>
      </header>

      {message && <p className="project-success">{message}</p>}
      {error && <p className="project-error">{error}</p>}

      <section className="project-details-section">
        <h2>Project Tools</h2>

        <div className="project-tools-grid">
          <Link to="/notes" className="project-tool-card">
            <FileText size={24} />
            <h3>Project Notes</h3>
            <p>Create and manage project notes.</p>
          </Link>

          <Link to="/files" className="project-tool-card">
            <Upload size={24} />
            <h3>File Sharing</h3>
            <p>Upload and access project files.</p>
          </Link>

          <Link to="/ai" className="project-tool-card">
            <Sparkles size={24} />
            <h3>AI Assistant</h3>
            <p>Get help with code and documentation.</p>
          </Link>
        </div>
      </section>

      <section className="project-team-section">
        <div className="project-team-heading">
          <Users size={22} />
          <h2>Team Members</h2>
          <span>{project.members?.length || 0}</span>
        </div>

        <div className="project-members-list">
          {project.members?.map((member) => (
            <div className="project-member" key={member._id}>
              <div className="project-member-avatar">
                {member.name?.charAt(0).toUpperCase()}
              </div>

              <div>
                <h4>{member.name}</h4>
                <p>{member.email}</p>
              </div>
            </div>
          ))}
        </div>

        <form className="project-add-member-form" onSubmit={handleAddMember}>
          <h3>
            <UserPlus size={19} /> Add Team Member
          </h3>

          <input
            type="email"
            placeholder="Enter registered user's email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button type="submit" disabled={addingMember}>
            {addingMember ? "Adding..." : "Add Member"}
          </button>
        </form>
      </section>
    </div>
  );
}

export default ProjectDetails;
