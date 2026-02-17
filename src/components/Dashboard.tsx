import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { JsonGenerator } from "./JsonGenerator";
import { JsonEditor } from "./JsonEditor";
import { FileList } from "./FileList";
import { Id } from "../../convex/_generated/dataModel";

export function Dashboard() {
  const files = useQuery(api.jsonFiles.list);
  const createFile = useMutation(api.jsonFiles.create);
  const [selectedFileId, setSelectedFileId] = useState<Id<"jsonFiles"> | null>(null);
  const [view, setView] = useState<"generator" | "editor" | "files">("generator");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const selectedFile = files?.find((f: { _id: Id<"jsonFiles"> }) => f._id === selectedFileId);

  const handleCreateFromGeneration = async (name: string, content: string) => {
    const id = await createFile({ name, content, description: "Generated with Grok AI" });
    setSelectedFileId(id);
    setView("editor");
    setMobileMenuOpen(false);
  };

  const handleSelectFile = (id: Id<"jsonFiles">) => {
    setSelectedFileId(id);
    setView("editor");
    setMobileMenuOpen(false);
  };

  const handleNewFile = async () => {
    const id = await createFile({
      name: "untitled.json",
      content: "{\n  \n}",
    });
    setSelectedFileId(id);
    setView("editor");
    setMobileMenuOpen(false);
  };

  return (
    <div className="dashboard">
      <button
        className="mobile-menu-toggle"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {mobileMenuOpen ? (
            <path d="M18 6L6 18M6 6l12 12" />
          ) : (
            <path d="M3 12h18M3 6h18M3 18h18" />
          )}
        </svg>
      </button>

      <aside className={`sidebar ${mobileMenuOpen ? "open" : ""}`}>
        <nav className="sidebar-nav">
          <button
            className={`nav-btn ${view === "generator" ? "active" : ""}`}
            onClick={() => { setView("generator"); setMobileMenuOpen(false); }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
            <span>AI Generator</span>
          </button>
          <button
            className={`nav-btn ${view === "files" ? "active" : ""}`}
            onClick={() => { setView("files"); setMobileMenuOpen(false); }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
            <span>My Files</span>
            {files && <span className="file-count">{files.length}</span>}
          </button>
          <button className="nav-btn new-file-btn" onClick={handleNewFile}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span>New File</span>
          </button>
        </nav>

        {view === "files" && (
          <div className="sidebar-files">
            <FileList
              files={files || []}
              selectedId={selectedFileId}
              onSelect={handleSelectFile}
            />
          </div>
        )}
      </aside>

      <section className="main-panel">
        {view === "generator" && (
          <JsonGenerator onSave={handleCreateFromGeneration} />
        )}
        {view === "editor" && selectedFile && (
          <JsonEditor file={selectedFile} onClose={() => setView("files")} />
        )}
        {view === "editor" && !selectedFile && (
          <div className="empty-state">
            <div className="empty-icon">
              <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="12" y="8" width="40" height="48" rx="4" />
                <path d="M20 24h24M20 32h24M20 40h16" />
              </svg>
            </div>
            <h3>No File Selected</h3>
            <p>Select a file from the sidebar or create a new one</p>
            <button onClick={handleNewFile} className="empty-action">
              Create New File
            </button>
          </div>
        )}
        {view === "files" && (
          <div className="files-main">
            <div className="files-header">
              <h2>Your JSON Files</h2>
              <button onClick={handleNewFile} className="create-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                New File
              </button>
            </div>
            {files === undefined ? (
              <div className="loading-files">Loading your files...</div>
            ) : files.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M32 16v32M16 32h32" />
                  </svg>
                </div>
                <h3>No Files Yet</h3>
                <p>Create your first JSON file or use the AI generator</p>
              </div>
            ) : (
              <div className="files-grid">
                {files.map((file: { _id: Id<"jsonFiles">; name: string; updatedAt: number }) => (
                  <button
                    key={file._id}
                    className="file-card"
                    onClick={() => handleSelectFile(file._id)}
                  >
                    <div className="file-card-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    </div>
                    <div className="file-card-info">
                      <h4>{file.name}</h4>
                      <p>{new Date(file.updatedAt).toLocaleDateString()}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
