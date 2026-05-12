import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const JobDetail = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [bidProposal, setBidProposal] = useState('');
  const [loading, setLoading] = useState(true);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchJob = async () => {
    try {
      const response = await api.get(`/jobs/${id}/`);
      setJob(response.data);
      if (response.data.status !== 'Open') {
        fetchMessages();
      }
    } catch (error) {
      console.error("Error fetching job details", error);
    }
    setLoading(false);
  };

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/jobs/${id}/messages/`);
      setMessages(response.data);
    } catch (error) {
      console.log("Not in progress or unauthorized for messages");
    }
  };

  useEffect(() => {
    fetchJob();
    const interval = setInterval(() => {
        if (job && job.status !== 'Open') fetchMessages();
    }, 5000);
    return () => clearInterval(interval);
  }, [id, job?.status]);

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/jobs/${id}/bid/`, {
        amount: bidAmount,
        proposal: bidProposal
      });
      alert('Bid submitted successfully!');
      fetchJob();
      setBidAmount('');
      setBidProposal('');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to submit bid');
    }
  };

  const handleAcceptBid = async (bidId) => {
    try {
      await api.post(`/bids/${bidId}/accept/`);
      alert('Bid accepted!');
      fetchJob();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to accept bid');
    }
  };

  const handleCompleteJob = async () => {
    try {
      await api.post(`/jobs/${id}/complete/`);
      alert('Job marked as completed!');
      fetchJob();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to complete job');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/jobs/${id}/review/`, {
        rating: reviewRating,
        comment: reviewComment
      });
      alert('Review submitted!');
      fetchJob();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to submit review');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      await api.post(`/jobs/${id}/messages/`, { content: newMessage });
      setNewMessage('');
      fetchMessages();
    } catch (error) {
      console.error("Failed to send message");
    }
  };

  if (loading) return <p>Loading job details...</p>;
  if (!job) return <p>Job not found.</p>;

  const isClient = user && user.id === job.client;
  const isFreelancer = user && user.username === job.freelancer_username;

  return (
    <div className="job-detail-page">
      <div className="job-header">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="badge">{job.category}</span>
            {isClient && job.status === 'In Progress' && (
                <button onClick={handleCompleteJob} className="btn-primary">Mark as Completed</button>
            )}
        </div>
        <h1>{job.title}</h1>
        <p className="meta">Posted by {job.client_username} • Budget: ${job.budget} • Status: {job.status}</p>
        {job.freelancer_username && <p className="meta">Freelancer: <strong>{job.freelancer_username}</strong></p>}
      </div>

      <div className="job-description">
        <h3>Description</h3>
        <p>{job.description}</p>
      </div>

      {(isClient || isFreelancer) && job.status !== 'Open' && (
          <div className="messaging-section" style={{ marginTop: '40px', paddingTop: '30px', borderTop: '1px solid #eee' }}>
              <h3>Messages</h3>
              <div className="messages-list" style={{ height: '200px', overflowY: 'auto', border: '1px solid #eee', padding: '10px', marginBottom: '10px', background: '#fcfcfc' }}>
                  {messages.map(m => (
                      <div key={m.id} style={{ marginBottom: '10px', textAlign: m.sender_username === user.username ? 'right' : 'left' }}>
                          <small>{m.sender_username}</small>
                          <div style={{ background: m.sender_username === user.username ? '#e3f2fd' : '#f5f5f5', padding: '8px', borderRadius: '8px', display: 'inline-block' }}>
                              {m.content}
                          </div>
                      </div>
                  ))}
              </div>
              <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px' }}>
                  <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." style={{ flex: 1 }} />
                  <button type="submit" className="btn-primary">Send</button>
              </form>
          </div>
      )}

      {isClient && job.status === 'Completed' && !job.review && (
          <div className="review-form-section" style={{ marginTop: '40px', paddingTop: '30px', borderTop: '1px solid #eee' }}>
              <h3>Leave a Review</h3>
              <form onSubmit={handleReviewSubmit}>
                  <div className="form-group">
                      <label>Rating (1-5)</label>
                      <select value={reviewRating} onChange={(e) => setReviewRating(e.target.value)}>
                          {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Stars</option>)}
                      </select>
                  </div>
                  <div className="form-group">
                      <label>Comment</label>
                      <textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} required></textarea>
                  </div>
                  <button type="submit" className="btn-primary">Submit Review</button>
              </form>
          </div>
      )}

      {job.review && (
          <div className="review-section" style={{ marginTop: '40px', paddingTop: '30px', borderTop: '1px solid #eee' }}>
              <h3>Review from Client</h3>
              <div className="card">
                  <strong>{job.review.rating} / 5 Stars</strong>
                  <p>{job.review.comment}</p>
              </div>
          </div>
      )}

      {job.bids && job.bids.length > 0 && job.status === 'Open' && (
        <div className="bids-section">
          <h3>Bids ({job.bid_count})</h3>
          <div className="bids-list">
            {job.bids.map(bid => (
              <div key={bid.id} className="bid-card">
                <div className="bid-info">
                  <strong>{bid.freelancer_username}</strong>
                  <span className="bid-amount">${bid.amount}</span>
                  <p>{bid.proposal}</p>
                  <span className={`status status-${bid.status.toLowerCase()}`}>{bid.status}</span>
                </div>
                {isClient && job.status === 'Open' && bid.status === 'Pending' && (
                  <button 
                    onClick={() => handleAcceptBid(bid.id)} 
                    className="btn-accept"
                  >
                    Accept Bid
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetail;
