import { useEffect, useState } from 'react';
import { Avatar, Button, Typography } from '@mui/material';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css'; // Your custom styles
import Fourbox from './fourbox'; // Import the FourBox component

export default function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get('http://127.0.0.1:8000/api/accounts/profile/', {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
        setProfile(res.data);
      } catch (err) {
        console.error('Failed to load profile:', err);
        window.location.href = '/login';
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <div className="d-flex dashboard-wrapper">
      {/* Left 20% area */}
      <div className={`left-pane ${isExpanded ? "expanded" : ""}`}>
        <div className="logo-container text-center">
          <img src="https://www.bluezinfo.com/assets/img/home-six/logo-white.png" alt="Logo" className="logo" />
          <h1 className="logo-text">Employee Attendance</h1>
          <button
          className="toggle-arrow"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? "▲" : "▼"}
        </button>

        </div>
        <nav className="nav-links">
          <a href="/">Dashboard</a>
          <a href="/register">Register</a>
          <a href="/login">Login</a>
          <a href="/list-team">List Team</a>
        </nav>
      </div>

      {/* Right 80% area */}
      <div className="right-pane text-end pe-4 pt-4">
        {profile && (
          <div className="profile-section">
            <Avatar
              alt={profile.username}
              src={profile.image}
              className="clickable-avatar"
              onClick={() => setShowDetails(!showDetails)}
            />
            {showDetails && (
              <div className="profile-details-box text-start mt-3">
                <Typography variant="h6">{profile.username}</Typography>
                <Typography variant="body1"><b>Position:</b> {profile.position}</Typography>
                <Typography variant="body2"><b>Employee ID:</b> {profile.employee_id}</Typography>
                <Button
                  className="mt-2"
                  variant="contained"
                  color="secondary"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </div>
            )}
          </div>
        )}
        <Fourbox />
      </div>
      
    </div>
  );
}
