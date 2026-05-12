import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const EditProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    bio: '',
    category: '',
    experience_years: 0
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, profRes] = await Promise.all([
          api.get('/categories/'),
          api.get('/profiles/')
        ]);
        setCategories(catRes.data.categories);
        if (profRes.data.length > 0) {
          setProfile(profRes.data[0]);
        }
      } catch (error) {
        console.error("Error fetching profile data", error);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (profile.id) {
        await api.put(`/profiles/${profile.id}/`, profile);
      } else {
        await api.post('/profiles/', profile);
      }
      alert('Profile updated!');
      navigate('/');
    } catch (error) {
      alert('Failed to update profile');
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="auth-page">
      <h2>Edit Profile</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Bio</label>
          <textarea 
            value={profile.bio} 
            onChange={(e) => setProfile({...profile, bio: e.target.value})}
            required
          ></textarea>
        </div>
        <div className="form-group">
          <label>Category</label>
          <select 
            value={profile.category} 
            onChange={(e) => setProfile({...profile, category: e.target.value})}
            required
          >
            <option value="">Select Category</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Years of Experience</label>
          <input 
            type="number" 
            value={profile.experience_years} 
            onChange={(e) => setProfile({...profile, experience_years: e.target.value})}
            required
          />
        </div>
        <button type="submit" className="btn-primary" style={{ width: '100%' }}>Save Changes</button>
      </form>
    </div>
  );
};

export default EditProfile;
