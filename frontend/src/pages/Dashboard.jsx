import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import NoteEditor from '../components/notes/NoteEditor';
import sanitizeHtml from 'sanitize-html';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Strict allowlist sanitizer
const sanitizeNoteContent = (html) => {
  if (!html) return '';
  return sanitizeHtml(html, {
    allowedTags: [
      'p', 'br', 'b', 'i', 'u', 's', 'strike',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'code',
      'pre', 'a', 'img', 'strong', 'em',
      'span', 'div', 'table', 'thead', 'tbody',
      'tr', 'th', 'td'
    ],
    allowedAttributes: {
      a: ['href', 'target'],
      img: ['src', 'alt', 'width', 'height'],
      '*': ['class', 'style']
    },
    allowedSchemes: ['http', 'https'],
    allowedSchemesByTag: {
      img: ['http', 'https', 'data']
    },
    allowedIframeHostnames: [],
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { target: '_blank' })
    }
  });
};

// Check if content has meaningful text or embeds
const hasValidContent = (html) => {
  if (!html) return false;
  
  // Sanitize first to remove dangerous content
  const sanitized = sanitizeNoteContent(html);
  
  // Use DOMParser to extract meaningful content
  const parser = new DOMParser();
  const doc = parser.parseFromString(sanitized, 'text/html');
  const body = doc.body;
  
  // Check for text content (excluding whitespace and non-breaking spaces)
  const text = body.textContent?.replace(/\u00a0/g, '').trim();
  
  // Check for images or other embeds
  const hasEmbed = body.querySelector('img') !== null;
  
  return Boolean(text || hasEmbed);
};

const Dashboard = () => {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Memoize sanitized notes to avoid re-sanitizing on every render
  const sanitizedNotes = useMemo(() => {
    return notes.map(note => ({
      ...note,
      sanitizedContent: sanitizeNoteContent(note.content)
    }));
  }, [notes]);

  const handleUnauthorized = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

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
          handleUnauthorized();
          return;
        }
        setError('Failed to fetch notes');
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, []);

  const createNote = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (!title.trim()) {
      setError('Please provide a title');
      return;
    }
    if (!hasValidContent(content)) {
      setError('Please provide meaningful content');
      return;
    }

    try {
      await axios.post(`${API_URL}/api/notes`, { 
        title: title.trim(), 
        content 
      }, {
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
      if (err.response?.status === 401) {
        handleUnauthorized();
        return;
      }
      setError('Failed to create note');
    }
  };

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
      if (err.response?.status === 401) {
        handleUnauthorized();
        return;
      }
      setError('Failed to delete note');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

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
        <NoteEditor value={content} onChange={setContent} />
        <button type="submit">Add Note</button>
      </form>

      <div className="notes-grid">
        {sanitizedNotes.length === 0 ? (
          <p className="no-notes">No notes yet. Create your first note!</p>
        ) : (
          sanitizedNotes.map((note) => (
            <div key={note._id} className="note-card">
              <h3>{note.title}</h3>
              <div 
                className="note-content" 
                dangerouslySetInnerHTML={{ __html: note.sanitizedContent }} 
              />
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
