import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'Freelancer',
    category: '',
    experience_years: 0,
    bio: ''
  });
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories/');
        setCategories(response.data.categories);
        if (response.data.categories.length > 0) {
          setFormData(prev => ({ ...prev, category: response.data.categories[0] }));
        }
      } catch (err) {
        console.error("Error fetching categories", err);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-form">
        <h2>Join Freelancher</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input name="username" type="text" value={formData.username} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input name="password" type="password" value={formData.password} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>I am a:</label>
            <select name="role" value={formData.role} onChange={handleChange}>
              <option value="Freelancer">Freelancer</option>
              <option value="Client">Client</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Primary Category</label>
            <select name="category" value={formData.category} onChange={handleChange} required>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {formData.role === 'Freelancer' && (
            <>
              <div className="form-group">
                <label>Years of Experience</label>
                <input name="experience_years" type="number" value={formData.experience_years} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Bio</label>
                <textarea name="bio" value={formData.bio} onChange={handleChange}></textarea>
              </div>
            </>
          )}
          
          <button type="submit" className="btn-primary">Register</button>
        </form>
        <p>Already have an account? <Link to="/login">Login here</Link></p>
      </div>
    </div>
  );
};

export default Register;
