import { useState, useEffect } from "react";
import "./NotePage.css";

type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
};

const API_BASE = import.meta.env.VITE_API_BASE;

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await fetch(`${API_BASE}/notes`);
        const data = await res.json();
        setNotes(data.notes || []);
      } catch (err) {
        console.error("Failed to fetch notes:", err);
      }
    };
    fetchNotes();
  }, []);

  const handleAddNote = async () => {
    if (!title.trim() || !content.trim()) return;

    try {
      const res = await fetch(`${API_BASE}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

  const handleDeleteNote = async (id: string) => {
    try {
      await fetch(`${API_BASE}/notes/${id}`, {
        method: "DELETE",
      });
      setNotes((prev) => prev.filter((note) => note.id !== id));
    } catch (err) {
      console.error("Failed to delete note:", err);
    }
  };

  const startEditing = (note: Note) => {
    setEditingNoteId(note.id);
    setEditTitle(note.title);
    setEditContent(note.content);
  };

  const handleUpdateNote = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/notes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle, content: editContent }),
      });     
      const { note: updatedNote } = await res.json();
      if(updatedNote){
        setNotes((prev) =>
        prev.map((n) => (n.id === id ? updatedNote : n))
      );
    }
      setEditingNoteId(null);
    } catch (err) {
      console.error("Failed to update note:", err);
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
         <div className="note-actions-top-right">
          <button
            className="icon-button"
            onClick={() => startEditing(note)}
            aria-label="Edit"
          >
            ✏️
          </button>
          <button
            className="icon-button"
            onClick={() => handleDeleteNote(note.id)}
            aria-label="Delete"
          >
            🗑️
          </button>
        </div>

          {editingNoteId === note.id ? (
            <>
              <input
                className="notes-input"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
              <textarea
                className="notes-textarea"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
              />
              <button onClick={() => handleUpdateNote(note.id)}>Save</button>
              <button onClick={() => setEditingNoteId(null)}>Cancel</button>
            </>
          ) : (
            <>
              <h3 className="note-title">{note.title}</h3>
              <p className="note-content">{note.content}</p>
              <small className="note-timestamp">
                {new Date(note.createdAt).toLocaleString()}
              </small>
            </>
          )}
        </div>

        ))}
      </div>
    </div>
  );
}
