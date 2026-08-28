import { useNavigate, Link } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();

  // Directly read from localStorage - no state, no effect
  const token = localStorage.getItem('token');
  let user = null;

  if (token) {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      if (userData && userData.name) {
        user = userData;
      }
    } catch {
      // Silently handle error
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // If no token or no user, redirect to login
  if (!token || !user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="profile-container">
      <h2>My Profile</h2>
      <div className="profile-card">
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Member since:</strong> {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
      </div>
      <div className="profile-actions">
        <Link to="/dashboard">
          <button className="back-btn">Back to Dashboard</button>
        </Link>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;