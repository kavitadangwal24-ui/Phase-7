
import { useEffect, useState } from "react";
import {
  Upload,
  File,
  FolderOpen,
  Eye,
  Download,
  X,
  Code,
  FileText,
  Sparkles,
} from "lucide-react";

import API from "../services/api";

function Files() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const [aiResponse, setAiResponse] = useState("");
  const [aiFileName, setAiFileName] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await API.get("/projects");
        const projectList = response.data.projects || [];

        setProjects(projectList);

        if (projectList.length > 0) {
          setSelectedProject(projectList[0]._id);
        }
      } catch (err) {
        setError("Failed to load projects.");
      }
    };

    fetchProjects();
  }, []);

  const fetchFiles = async () => {
    if (!selectedProject) {
      setFiles([]);
      return;
    }

    setLoading(true);

    try {
      const response = await API.get(
        `/files/project/${selectedProject}`
      );

      setFiles(response.data.files || []);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load files."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [selectedProject]);

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!selectedFile || !selectedProject) {
      setError("Select a project and a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("projectId", selectedProject);
    formData.append("file", selectedFile);

    setUploading(true);
    setError("");
    setMessage("");

    try {
      const response = await API.post(
        "/files/upload",
        formData
      );

      setMessage(response.data.message);
      setSelectedFile(null);
      e.target.reset();

      await fetchFiles();
    } catch (err) {
      setError(
        err.response?.data?.message || "File upload failed."
      );
    } finally {
      setUploading(false);
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(2)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getExtension = (file) =>
    file.originalName?.split(".").pop().toLowerCase();

  const isImage = (file) =>
    file.mimeType?.startsWith("image/");

  const isTextFile = (file) => {
    const supportedExtensions = [
      "txt", "js", "jsx", "ts", "tsx",
      "html", "css", "json", "md",
      "py", "java", "c", "cpp", "xml",
      "csv", "yml", "yaml", "log",
    ];

    return (
      file.mimeType?.startsWith("text/") ||
      supportedExtensions.includes(getExtension(file))
    );
  };

  const isCodeFile = (file) => {
    const codeExtensions = [
      "js", "jsx", "ts", "tsx",
      "html", "css", "json",
      "py", "java", "c", "cpp",
      "xml", "yml", "yaml",
    ];

    return codeExtensions.includes(getExtension(file));
  };

  const handlePreview = async (file) => {
    setPreviewLoading(true);
    setError("");
    setPreview(null);

    try {
      const response = await API.get(
        `/files/preview/${file._id}`,
        { responseType: "blob" }
      );

      const blob = response.data;
      const url = URL.createObjectURL(blob);

      if (isImage(file)) {
        setPreview({
          type: "image",
          url,
          name: file.originalName,
          fileId: file._id,
        });
      } else if (isTextFile(file)) {
        const content = await blob.text();

        URL.revokeObjectURL(url);

        setPreview({
          type: "text",
          content,
          name: file.originalName,
          fileId: file._id,
        });
      } else {
        URL.revokeObjectURL(url);

        setPreview({
          type: "unsupported",
          name: file.originalName,
          fileId: file._id,
        });
      }
    } catch (err) {
      setError(
        "Failed to preview file. Please check the preview API."
      );
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDownload = async (file) => {
    try {
      const response = await API.get(
        `/files/preview/${file._id}`,
        { responseType: "blob" }
      );

      const url = URL.createObjectURL(response.data);
      const link = document.createElement("a");

      link.href = url;
      link.download = file.originalName;

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);
    } catch (err) {
      setError("Failed to download file.");
    }
  };

  // Gemini Code Explanation
  const handleGeminiCode = async (file) => {
    setAiLoading(true);
    setAiResponse("");
    setAiFileName(file.originalName);
    setError("");

    try {
      const response = await API.get(
        `/files/preview/${file._id}`,
        { responseType: "blob" }
      );

      const code = await response.data.text();

      if (!code.trim()) {
        setError("This code file is empty.");
        return;
      }

      const aiResult = await API.post("/gemini/ask", {
        projectId: selectedProject,
        action: "explain",
        prompt: `Explain this code file in simple language.
        Describe its purpose, important functions, and how it works.
        Include examples where useful.

        File name: ${file.originalName}

        Code:
        ${code}`,
      });

      setAiResponse(aiResult.data.response);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Gemini could not explain this code. Please try again."
      );
    } finally {
      setAiLoading(false);
    }
  };

  const closePreview = () => {
    if (preview?.url) {
      URL.revokeObjectURL(preview.url);
    }

    setPreview(null);
  };

  return (
    <div className="files-page">
      <header className="files-header">
        <div>
          <p>Workspace</p>
          <h1>File Sharing</h1>
          <span>Upload and manage your project files.</span>
        </div>
      </header>

      <section className="files-project-select">
        <label>Select Project</label>

        <select
          value={selectedProject}
          onChange={(e) => {
            closePreview();
            setAiResponse("");
            setSelectedProject(e.target.value);
          }}
        >
          <option value="">Choose a project</option>

          {projects.map((project) => (
            <option key={project._id} value={project._id}>
              {project.title}
            </option>
          ))}
        </select>
      </section>

      <form className="files-upload-card" onSubmit={handleUpload}>
        <Upload size={32} />
        <h2>Upload a File</h2>
        <p>Choose a file up to 10 MB.</p>

        <input
          type="file"
          onChange={(e) =>
            setSelectedFile(e.target.files?.[0] || null)
          }
          required
        />

        {selectedFile && (
          <p>Selected: {selectedFile.name}</p>
        )}

        <button
          type="submit"
          disabled={uploading || !selectedProject}
        >
          <Upload size={17} />
          {uploading ? "Uploading..." : "Upload File"}
        </button>
      </form>

      {message && <p className="files-success">{message}</p>}
      {error && <p className="files-error">{error}</p>}

      <section className="files-list-section">
        <div className="files-list-heading">
          <FolderOpen size={22} />
          <h2>Uploaded Files</h2>
          <span>{files.length}</span>
        </div>

        {loading ? (
          <p>Loading files...</p>
        ) : files.length === 0 ? (
          <div className="files-empty">
            <File size={38} />
            <h3>No files uploaded</h3>
            <p>Upload your first project file.</p>
          </div>
        ) : (
          <div className="files-grid">
            {files.map((file) => (
              <div className="file-card" key={file._id}>
                <File size={25} />

                <div>
                  <h3>{file.originalName}</h3>
                  <p>{formatSize(file.fileSize)}</p>

                  <span>
                    Uploaded by: {file.uploadedBy?.name || "Unknown"}
                  </span>
                </div>

                <div className="file-actions">
                  {isCodeFile(file) && (
                    <button
                      type="button"
                      onClick={() => handleGeminiCode(file)}
                      title="Explain code with Gemini"
                      disabled={aiLoading}
                    >
                      <Sparkles size={17} />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handlePreview(file)}
                    title="Preview file"
                  >
                    <Eye size={17} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownload(file)}
                    title="Download file"
                  >
                    <Download size={17} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {aiLoading && (
        <div className="files-ai-response">
          <Sparkles size={22} />
          <p>Gemini is analyzing {aiFileName}...</p>
        </div>
      )}

      {aiResponse && (
        <section className="files-ai-response">
          <div>
            <Sparkles size={22} />
            <h2>Gemini Code Explanation</h2>
          </div>

          <p>File: {aiFileName}</p>

          <pre>
            <code>{aiResponse}</code>
          </pre>

          <button
            type="button"
            onClick={() => {
              setAiResponse("");
              setAiFileName("");
            }}
          >
            Close Explanation
          </button>
        </section>
      )}

      {previewLoading && <p>Loading preview...</p>}

      {preview && (
        <div className="file-preview-overlay">
          <div className="file-preview-modal">
            <div className="file-preview-heading">
              <div>
                <Eye size={20} />
                <h2>{preview.name}</h2>
              </div>

              <button type="button" onClick={closePreview}>
                <X size={20} />
              </button>
            </div>

            <div className="file-preview-content">
              {preview.type === "image" && (
                <img
                  src={preview.url}
                  alt={preview.name}
                />
              )}

              {preview.type === "text" && (
                <pre>
                  <code>{preview.content}</code>
                </pre>
              )}

              {preview.type === "unsupported" && (
                <div>
                  <FileText size={40} />
                  <p>
                    Preview is not supported for this file type.
                  </p>
                </div>
              )}
            </div>

            <div className="file-preview-footer">
              <button
                type="button"
                onClick={() =>
                  handleDownload({
                    _id: preview.fileId,
                    originalName: preview.name,
                  })
                }
              >
                <Download size={17} />
                Download File
              </button>

              <button type="button" onClick={closePreview}>
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Files;
