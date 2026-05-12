import React from 'react';
import { Link } from 'react-router-dom';

const JobCard = ({ job }) => {
  return (
    <div className="card job-card">
      <div className="card-body">
        <span className="badge">{job.category}</span>
        <h3><Link to={`/jobs/${job.id}`}>{job.title}</Link></h3>
        <p className="description">{job.description.substring(0, 100)}...</p>
        <div className="card-footer">
          <span className="budget">Budget: ${job.budget}</span>
          <span className={`status status-${job.status.toLowerCase().replace(' ', '-')}`}>
            {job.status}
          </span>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
