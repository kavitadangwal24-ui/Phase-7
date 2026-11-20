
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FolderKanban,
  Users,
  FileText,
  Plus,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await API.get("/projects");
        setProjects(response.data.projects || []);
      } catch (err) {
        setError(
          err.response?.data?.message || "Unable to load projects."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const stats = [
    {
      title: "Total Projects",
      value: projects.length,
      icon: <FolderKanban size={22} />,
    },
    {
      title: "Team Members",
      value: projects.reduce(
        (total, project) => total + (project.members?.length || 0),
        0
      ),
      icon: <Users size={22} />,
    },
    {
      title: "Active Projects",
      value: projects.length,
      icon: <FileText size={22} />,
    },
  ];

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p>Workspace Overview</p>
          <h1>Welcome back, {user?.name || "Developer"}!</h1>
          <span>Here's what's happening in your workspace.</span>
        </div>

        <Link to="/projects" className="dashboard-create-btn">
          <Plus size={18} />
          New Project
        </Link>
      </header>

      <section className="dashboard-stats">
        {stats.map((stat, index) => (
          <div className="dashboard-stat-card" key={index}>
            <div className="dashboard-stat-icon">{stat.icon}</div>
            <p>{stat.title}</p>
            <h2>{stat.value}</h2>
          </div>
        ))}
      </section>

      <section className="dashboard-project-section">
        <div className="dashboard-section-heading">
          <div>
            <h2>Recent Projects</h2>
            <p>Your latest collaborative work</p>
          </div>

          <Link to="/projects">
            View All <ArrowUpRight size={16} />
          </Link>
        </div>

        {loading ? (
          <p>Loading projects...</p>
        ) : error ? (
          <p>{error}</p>
        ) : projects.length === 0 ? (
          <div className="dashboard-empty">
            <FolderKanban size={38} />
            <h3>No projects yet</h3>
            <p>Create your first project and start collaborating.</p>
            <Link to="/projects">
              <Plus size={17} /> Create Project
            </Link>
          </div>
        ) : (
          <div className="dashboard-project-grid">
            {projects.slice(0, 4).map((project) => (
              <Link
                to={`/projects/${project._id}`}
                className="dashboard-project-card"
                key={project._id}
              >
                <div className="dashboard-project-icon">
                  <FolderKanban size={21} />
                </div>

                <h3>{project.title}</h3>
                <p>{project.description || "No description available."}</p>

                <span>
                  <Users size={15} />
                  {project.members?.length || 0} Members
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="dashboard-ai-banner">
        <div>
          <Sparkles size={25} />
          <h2>Meet Your AI Assistant</h2>
          <p>Explain code, improve notes and generate documentation.</p>
        </div>

        <Link to="/ai">Explore AI Assistant</Link>
      </section>
    </div>
  );
}

export default Dashboard;
