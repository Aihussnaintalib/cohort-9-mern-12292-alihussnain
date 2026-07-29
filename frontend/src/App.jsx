
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import './App.css';

// Placeholder component - will be replaced in PR #10
const DashboardPlaceholder = () => <h2>Dashboard (Coming Soon)</h2>;

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<h2>Home</h2>} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<DashboardPlaceholder />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
