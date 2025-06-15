import { useState } from "react";
import "./NotePage.css";

type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
};

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleAddNote = () => {
    if (!title.trim() || !content.trim()) return;

    const newNote: Note = {
      id: Date.now().toString(),
      title: title.trim(),
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };

    setNotes((prev) => [newNote, ...prev]);
    setTitle("");
    setContent("");
  };

  return (
    <div className="notes-container">
      <h1 className="notes-heading">📝 Notes</h1>

      <div className="notes-form">
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="notes-input"
        />
        <textarea
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="notes-textarea"
        />
        <button
          onClick={handleAddNote}
          className="notes-button"
          disabled={!title.trim() || !content.trim()}
        >
          Add Note
        </button>
      </div>

      <div className="notes-list">
        {notes.map((note) => (
          <div key={note.id} className="note-card">
            <h3 className="note-title">{note.title}</h3>
            <p className="note-content">{note.content}</p>
            <small className="note-timestamp">
              {new Date(note.createdAt).toLocaleString()}
            </small>
          </div>
        ))}
      </div>
    </div>
  );
}
