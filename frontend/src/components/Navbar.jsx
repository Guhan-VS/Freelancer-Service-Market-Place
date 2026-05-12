import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="navbar-brand">Freelancher</Link>
        <div className="nav-links">
          {user ? (
            <>
              {user.role === 'Client' && (
                <Link to="/post-job" className="nav-link">Post a Job</Link>
              )}
              <Link to="/edit-profile" className="nav-link">Profile</Link>
              <span className="user-info">Hello, {user.username} ({user.role})</span>
              <button onClick={handleLogout} className="btn-logout">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-link btn-primary">Join</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
