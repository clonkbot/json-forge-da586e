import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect, useCallback } from "react";
import { Doc } from "../../convex/_generated/dataModel";

interface Props {
  file: Doc<"jsonFiles">;
  onClose: () => void;
}

export function JsonEditor({ file, onClose }: Props) {
  const [content, setContent] = useState(file.content);
  const [name, setName] = useState(file.name);
  const [isValid, setIsValid] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const updateFile = useMutation(api.jsonFiles.update);
  const deleteFile = useMutation(api.jsonFiles.remove);

  useEffect(() => {
    setContent(file.content);
    setName(file.name);
  }, [file._id, file.content, file.name]);

  const validateJson = useCallback((text: string) => {
    try {
      JSON.parse(text);
      setIsValid(true);
      setError(null);
      return true;
    } catch (e) {
      setIsValid(false);
      setError(e instanceof Error ? e.message : "Invalid JSON");
      return false;
    }
  }, []);

  const handleContentChange = (value: string) => {
    setContent(value);
    validateJson(value);
  };

  const handleSave = async () => {
    if (!validateJson(content)) return;
    setIsSaving(true);
    try {
      await updateFile({ id: file._id, content, name });
      setLastSaved(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(content);
      setContent(JSON.stringify(parsed, null, 2));
      setIsValid(true);
      setError(null);
    } catch {
      // Already invalid, error is shown
    }
  };

  const handleMinify = () => {
    try {
      const parsed = JSON.parse(content);
      setContent(JSON.stringify(parsed));
      setIsValid(true);
      setError(null);
    } catch {
      // Already invalid
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this file?")) {
      await deleteFile({ id: file._id });
      onClose();
    }
  };

  return (
    <div className="editor">
      <div className="editor-header">
        <div className="editor-title-row">
          <button onClick={onClose} className="back-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="file-name-input"
            placeholder="filename.json"
          />
          <div className={`validity-badge ${isValid ? "valid" : "invalid"}`}>
            {isValid ? "✓ Valid" : "✗ Invalid"}
          </div>
        </div>
        <div className="editor-actions">
          <button onClick={handleFormat} className="tool-btn" title="Format JSON">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="21" y1="10" x2="3" y2="10" />
              <line x1="21" y1="6" x2="3" y2="6" />
              <line x1="21" y1="14" x2="3" y2="14" />
              <line x1="21" y1="18" x2="3" y2="18" />
            </svg>
            <span>Format</span>
          </button>
          <button onClick={handleMinify} className="tool-btn" title="Minify JSON">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="4 14 10 14 10 20" />
              <polyline points="20 10 14 10 14 4" />
              <line x1="14" y1="10" x2="21" y2="3" />
              <line x1="3" y1="21" x2="10" y2="14" />
            </svg>
            <span>Minify</span>
          </button>
          <button onClick={handleCopy} className="tool-btn" title="Copy">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            <span>Copy</span>
          </button>
          <button onClick={handleDownload} className="tool-btn" title="Download">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Download</span>
          </button>
          <button onClick={handleDelete} className="tool-btn delete-btn" title="Delete">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            <span>Delete</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="editor-error">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <div className="editor-body">
        <textarea
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          className="code-editor"
          spellCheck={false}
        />
      </div>

      <div className="editor-footer">
        <div className="footer-info">
          {lastSaved && (
            <span className="last-saved">
              Last saved: {lastSaved.toLocaleTimeString()}
            </span>
          )}
          <span className="char-count">{content.length} characters</span>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving || !isValid}
          className="save-btn"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
