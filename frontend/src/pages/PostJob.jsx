import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const PostJob = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    category: ''
  });
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.profile?.role !== 'Client') {
      navigate('/');
    }
  }, [user, navigate]);

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
      const response = await api.post('/jobs/', formData);
      navigate(`/jobs/${response.data.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to post job');
    }
  };

  return (
    <div className="post-job-page">
      <div className="form-container">
        <h2>Post a New Job</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Job Title</label>
            <input name="title" type="text" value={formData.title} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} required></textarea>
          </div>
          <div className="form-group">
            <label>Budget ($)</label>
            <input name="budget" type="number" value={formData.budget} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Category</label>
            <select name="category" value={formData.category} onChange={handleChange} required>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn-primary">Post Job</button>
        </form>
      </div>
    </div>
  );
};

export default PostJob;
