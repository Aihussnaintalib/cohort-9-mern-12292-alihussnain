import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import NoteEditor from '../components/notes/NoteEditor';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const EditNote = () => {
  // --- State Definitions ---
  // Sab se pehle sab states ko ek jagah define karo.
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(''); 

  const navigate = useNavigate();
  const { id } = useParams();
  const token = localStorage.getItem('token');

 
  useEffect(() => {
    const fetchNote = async () => {
      // Agar token nahi hai toh login par bhejo
      if (!token) {
        navigate('/login');
        return;
      }

      
      if (!id) {
        setErrorMessage('Invalid note ID');
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${API_URL}/api/notes/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data?.data) {
          setNoteTitle(response.data.data.title || '');
          setNoteContent(response.data.data.content || '');
        } else {
          setErrorMessage('Note not found');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
          return;
        }
        if (err.response?.status === 404) {
          setErrorMessage('Note not found');
        } else {
          setErrorMessage('Failed to fetch note. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchNote();
    
  }, [id, token, navigate]);

  
  const isValidContent = (html) => {
    if (!html) return false;
    
    const clean = html
      .replace(/<p>\s*<\/p>/g, '')
      .replace(/<p><br><\/p>/g, '')
      .replace(/&nbsp;/g, '')
      .trim();
    return clean.length > 0;
  };

  
  const handleUpdate = async (e) => {
    e.preventDefault();
    setErrorMessage(''); // Submit karte waqt pehle error clear karo

    // Validation
    if (!noteTitle.trim()) {
      setErrorMessage('Please provide a title');
      return;
    }

    if (!isValidContent(noteContent)) {
      setErrorMessage('Please provide meaningful content');
      return;
    }

    try {
      await axios.put(`${API_URL}/api/notes/${id}`, {
        title: noteTitle.trim(),
        content: noteContent
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/dashboard'); // Update ke baad dashboard par le jao
    } catch (err) {
      console.error('Update error:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
        return;
      }
      if (err.response?.status === 404) {
        setErrorMessage('Note not found');
      } else {
        setErrorMessage('Failed to update note. Please try again.');
      }
    }
  };

  // --- Loading State ---
  if (isLoading) return <div className="loading">Loading note...</div>;

  // --- Render ---
  return (
    <div className="dashboard">
      <div className="header">
        <h2>Edit Note</h2>
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
      </div>

      
      {errorMessage && <div className="error-message">{errorMessage}</div>}

      <form onSubmit={handleUpdate} className="note-form">
        <input
          type="text"
          placeholder="Note Title"
          value={noteTitle}
          onChange={(e) => setNoteTitle(e.target.value)}
          required
        />
        <NoteEditor value={noteContent} onChange={setNoteContent} />
        <div className="form-actions">
          <button type="submit" className="update-btn" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Update Note'}
          </button>
          <button type="button" className="cancel-btn" onClick={() => navigate('/dashboard')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditNote;