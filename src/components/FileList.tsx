import { Doc, Id } from "../../convex/_generated/dataModel";

interface Props {
  files: Doc<"jsonFiles">[];
  selectedId: Id<"jsonFiles"> | null;
  onSelect: (id: Id<"jsonFiles">) => void;
}

export function FileList({ files, selectedId, onSelect }: Props) {
  if (files.length === 0) {
    return (
      <div className="file-list-empty">
        <p>No files yet</p>
      </div>
    );
  }

  return (
    <div className="file-list">
      {files.map((file) => (
        <button
          key={file._id}
          className={`file-item ${selectedId === file._id ? "selected" : ""}`}
          onClick={() => onSelect(file._id)}
        >
          <div className="file-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <div className="file-info">
            <span className="file-name">{file.name}</span>
            <span className="file-date">
              {new Date(file.updatedAt).toLocaleDateString()}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}
