import { useState, useEffect } from "react";
import "./NotePage.css";

type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
};

const API_BASE = import.meta.env.VITE_API_BASE;

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // 🔄 Fetch notes from Lambda
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await fetch(`${API_BASE}/notes`, {
          method: "GET",
        });
        const data = await res.json();       
        setNotes(data.notes || []);
      } catch (err) {
        console.error("Failed to fetch notes:", err);
      }
    };
    fetchNotes();
  }, []);

  // ➕ Add new note via Lambda
  const handleAddNote = async () => {
    if (!title.trim() || !content.trim()) return;

    try {
      const res = await fetch(`${API_BASE}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: title.trim(), content: content.trim() }),
      });

      const { note } = await res.json();
      setNotes((prev) => [note, ...prev]);
      setTitle("");
      setContent("");
    } catch (err) {
      console.error("Failed to create note:", err);
    }
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
