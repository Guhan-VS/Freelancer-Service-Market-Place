import React from 'react';
import { Link } from 'react-router-dom';

const FreelancerCard = ({ freelancer }) => {
  return (
    <div className="card freelancer-card">
      <div className="card-body">
        <span className="badge">{freelancer.category}</span>
        <h3><Link to={`/freelancers/${freelancer.id}`}>{freelancer.name}</Link></h3>
        <p className="experience">{freelancer.experience_years} years experience</p>
        <p className="bio">{freelancer.bio?.substring(0, 100) || "No bio provided"}...</p>
      </div>
    </div>
  );
};

export default FreelancerCard;
