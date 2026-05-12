import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const FreelancerDetail = () => {
  const { id } = useParams();
  const [freelancer, setFreelancer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddProject, setShowAddProject] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', description: '' });
  const { user } = useAuth();

  const fetchFreelancer = async () => {
    try {
      const response = await api.get(`/freelancers/${id}/`);
      setFreelancer(response.data);
    } catch (error) {
      console.error("Error fetching freelancer details", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFreelancer();
  }, [id]);

  const handleAddProject = async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects/', newProject);
      setShowAddProject(false);
      setNewProject({ title: '', description: '' });
      fetchFreelancer();
    } catch (error) {
      alert('Failed to add project');
    }
  };

  if (loading) return <p>Loading profile...</p>;
  if (!freelancer) return <p>Freelancer not found.</p>;

  const isOwner = user && user.id === freelancer.id;

  return (
    <div className="freelancer-detail-page">
      <div className="profile-header">
        <h1>{freelancer.name}</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span className="badge">{freelancer.category}</span>
            <span style={{ fontWeight: 'bold', color: '#f57c00' }}>⭐ {freelancer.avg_rating.toFixed(1)} ({freelancer.review_count} reviews)</span>
        </div>
        <p className="experience">{freelancer.experience_years} years of experience</p>
      </div>

      <div className="profile-bio">
        <h3>About Me</h3>
        <p>{freelancer.bio || "No bio provided."}</p>
      </div>

      <div className="projects-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Projects / Portfolio</h3>
            {isOwner && (
                <button onClick={() => setShowAddProject(!showAddProject)} className="btn-primary">
                    {showAddProject ? 'Cancel' : 'Add Project'}
                </button>
            )}
        </div>

        {showAddProject && (
            <div className="card" style={{ marginBottom: '20px', padding: '20px' }}>
                <form onSubmit={handleAddProject}>
                    <div className="form-group">
                        <label>Project Title</label>
                        <input 
                            type="text" 
                            value={newProject.title} 
                            onChange={(e) => setNewProject({...newProject, title: e.target.value})} 
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <textarea 
                            value={newProject.description} 
                            onChange={(e) => setNewProject({...newProject, description: e.target.value})} 
                            required
                        ></textarea>
                    </div>
                    <button type="submit" className="btn-primary">Save Project</button>
                </form>
            </div>
        )}

        <div className="projects-grid">
          {freelancer.projects && freelancer.projects.length > 0 ? (
            freelancer.projects.map(project => (
              <div key={project.id} className="project-card">
                <div>
                    <h4>{project.title}</h4>
                    <p>{project.description}</p>
                </div>
              </div>
            ))
          ) : (
            <p>No projects showcased yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FreelancerDetail;
