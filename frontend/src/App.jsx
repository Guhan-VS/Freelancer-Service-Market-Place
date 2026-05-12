import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import JobDetail from './pages/JobDetail';
import FreelancerDetail from './pages/FreelancerDetail';
import PostJob from './pages/PostJob';
import EditProfile from './pages/EditProfile';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="container" style={{ marginTop: '40px' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/jobs/:id" element={<JobDetail />} />
            <Route path="/freelancers/:id" element={<FreelancerDetail />} />
            <Route path="/post-job" element={<PostJob />} />
            <Route path="/edit-profile" element={<EditProfile />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
