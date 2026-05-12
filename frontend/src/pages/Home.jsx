import React, { useState, useEffect } from 'react';
import api from '../api';
import JobCard from '../components/JobCard';
import FreelancerCard from '../components/FreelancerCard';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [view, setView] = useState('freelancers'); // 'freelancers' or 'jobs'
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories/');
        setCategories(response.data.categories);
      } catch (error) {
        console.error("Error fetching categories", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const endpoint = view === 'freelancers' ? '/freelancers/' : '/jobs/';
        const response = await api.get(endpoint, {
          params: { category: selectedCategory }
        });
        setItems(response.data);
      } catch (error) {
        console.error(`Error fetching ${view}`, error);
      }
      setLoading(false);
    };
    fetchItems();
  }, [view, selectedCategory]);

  return (
    <div className="home-page">
      <div className="sidebar">
        <h3>Categories</h3>
        <ul>
          <li 
            className={selectedCategory === '' ? 'active' : ''} 
            onClick={() => setSelectedCategory('')}
          >
            All Categories
          </li>
          {categories.map(cat => (
            <li 
              key={cat} 
              className={selectedCategory === cat ? 'active' : ''} 
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </li>
          ))}
        </ul>
      </div>
      <div className="main-content">
        <div className="view-switcher">
          <button 
            className={view === 'freelancers' ? 'active' : ''} 
            onClick={() => setView('freelancers')}
          >
            Freelancers
          </button>
          <button 
            className={view === 'jobs' ? 'active' : ''} 
            onClick={() => setView('jobs')}
          >
            Jobs
          </button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid">
            {items.length > 0 ? (
              items.map(item => (
                view === 'freelancers' 
                  ? <FreelancerCard key={item.id} freelancer={item} />
                  : <JobCard key={item.id} job={item} />
              ))
            ) : (
              <p>No {view} found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
