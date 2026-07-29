import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000';

const Dashboard = () => {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fetch notes on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchNotes = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/notes`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotes(response.data?.data || []);
        setError('');
      } catch (err) {
        console.error('Fetch error:', err);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        }
        setError('Failed to fetch notes');
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, []); // ✅ Empty array - runs only once

  // Create a new note
  const createNote = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (!title.trim() || !content.trim()) {
      setError('Please provide title and content');
      return;
    }

    try {
      await axios.post(`${API_URL}/api/notes`, { title, content }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTitle('');
      setContent('');
      setError('');
      
      // Refetch notes after create
      const response = await axios.get(`${API_URL}/api/notes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotes(response.data?.data || []);
    } catch (err) {
      console.error('Create error:', err);
      setError('Failed to create note');
    }
  };

  // Delete a note
  const deleteNote = async (id) => {
    const token = localStorage.getItem('token');
    if (!window.confirm('Are you sure you want to delete this note?')) return;

    try {
      await axios.delete(`${API_URL}/api/notes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Refetch notes after delete
      const response = await axios.get(`${API_URL}/api/notes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotes(response.data?.data || []);
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete note');
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Loading state
  if (loading) {
    return <div className="loading">Loading notes...</div>;
  }

  return (
    <div className="dashboard">
      <div className="header">
        <h2>My Notes</h2>
        <div className="header-actions">
          <button className="profile-btn" onClick={() => navigate('/profile')}>
            Profile
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={createNote} className="note-form">
        <input
          type="text"
          placeholder="Note Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Note Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
        <button type="submit">Add Note</button>
      </form>

      <div className="notes-grid">
        {notes.length === 0 ? (
          <p className="no-notes">No notes yet. Create your first note!</p>
        ) : (
          notes.map((note) => (
            <div key={note._id} className="note-card">
              <h3>{note.title}</h3>
              <p>{note.content}</p>
              <small>{new Date(note.createdAt).toLocaleDateString()}</small>
              <button className="delete-btn" onClick={() => deleteNote(note._id)}>
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;