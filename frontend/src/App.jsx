import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import Dashboard from './pages/Dashboard';
import './App.css';

// Placeholder Profile component
const ProfilePlaceholder = () => (
  <div className="profile-container">
    <h2>Profile</h2>
    <p>Profile page coming soon...</p>
    <Link to="/dashboard">
      <button>Back to Dashboard</button>
    </Link>
  </div>
);

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<h2>Home</h2>} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<ProfilePlaceholder />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;