
import { useEffect, useState } from "react";
import {
  Sparkles,
  Send,
  Code,
  FileText,
  BookOpen,
  WandSparkles,
  Copy,
} from "lucide-react";
import API from "../services/api";

function AI() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [action, setAction] = useState("explain");
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const result = await API.get("/projects");
        const projectList = result.data.projects || [];

        setProjects(projectList);

        if (projectList.length > 0) {
          setSelectedProject(projectList[0]._id);
        }
      } catch (err) {
        setError("Unable to load projects.");
      }
    };

    fetchProjects();
  }, []);

  const actions = [
    {
      value: "explain",
      label: "Explain Code",
      icon: <Code size={19} />,
    },
    {
      value: "improve",
      label: "Improve Content",
      icon: <WandSparkles size={19} />,
    },
    {
      value: "documentation",
      label: "Documentation",
      icon: <BookOpen size={19} />,
    },
    {
      value: "readme",
      label: "Generate README",
      icon: <FileText size={19} />,
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedProject || !prompt.trim()) {
      setError("Select a project and enter your prompt.");
      return;
    }

    setLoading(true);
    setError("");
    setResponse("");

    try {
      const result = await API.post("/gemini/ask", {
        projectId: selectedProject,
        action,
        prompt,
      });

      setResponse(result.data.response);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "AI request failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const copyResponse = async () => {
    try {
      await navigator.clipboard.writeText(response);
    } catch {
      setError("Unable to copy response.");
    }
  };

  return (
    <div className="ai-page">
      <header className="ai-header">
        <div className="ai-header-icon">
          <Sparkles size={28} />
        </div>

        <div>
          <p>Powered by Google Gemini</p>
          <h1>AI Assistant</h1>
          <span>Your intelligent development companion.</span>
        </div>
      </header>

      <section className="ai-workspace">
        <div className="ai-project-select">
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

        <h2>What would you like Gemini to do?</h2>

        <div className="ai-action-grid">
          {actions.map((item) => (
            <button
              type="button"
              key={item.value}
              className={
                action === item.value
                  ? "ai-action-card active"
                  : "ai-action-card"
              }
              onClick={() => setAction(item.value)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <form className="ai-prompt-form" onSubmit={handleSubmit}>
          <label>Your Prompt</label>

          <textarea
            rows={7}
            placeholder="Paste your code, notes, or project details here..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading || !selectedProject}
          >
            <Send size={18} />
            {loading ? "Generating..." : "Generate Response"}
          </button>
        </form>

        {error && <p className="ai-error">{error}</p>}

        {loading && (
          <div className="ai-loading">
            <Sparkles size={22} />
            Gemini is thinking...
          </div>
        )}

        {response && (
          <section className="ai-response">
            <div className="ai-response-heading">
              <h2>
                <Sparkles size={20} /> Gemini Response
              </h2>

              <button onClick={copyResponse} type="button">
                <Copy size={16} /> Copy
              </button>
            </div>

            <pre>{response}</pre>
          </section>
        )}
      </section>
    </div>
  );
}

export default AI;
