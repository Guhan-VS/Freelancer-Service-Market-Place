const API_BASE_URL = '/api'; // Use local API

// State
let currentUser = null;
let currentView = 'freelancers';
let selectedCategory = '';

// DOM Elements
const categoryList = document.getElementById('category-list');
const mainGrid = document.getElementById('main-grid');
const sectionTitle = document.getElementById('section-title');
const btnLogin = document.getElementById('btn-login');
const btnRegister = document.getElementById('btn-register');
const userInfo = document.getElementById('user-info');
const usernameDisplay = document.getElementById('username-display');
const roleDisplay = document.getElementById('role-display');
const btnLogout = document.getElementById('btn-logout');
const viewFreelancers = document.getElementById('view-freelancers');
const viewJobs = document.getElementById('view-jobs');
const btnPostJob = document.getElementById('btn-post-job');

const authModal = document.getElementById('auth-modal');
const loginFormDiv = document.getElementById('login-form-div');
const registerFormDiv = document.getElementById('register-form-div');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const regRole = document.getElementById('reg-role');
const freelancerFields = document.getElementById('freelancer-fields');
const regCategory = document.getElementById('reg-category');

const detailModal = document.getElementById('modal');
const modalBody = document.getElementById('modal-body');

// --- Initialization ---

async function init() {
    await checkAuth();
    await loadCategories();
    switchView('freelancers');
    setupEventListeners();
}

async function checkAuth() {
    try {
        const res = await fetch(`${API_BASE_URL}/auth/me/`);
        if (res.ok) {
            currentUser = await res.json();
            updateUIForAuth();
        }
    } catch (e) {
        console.log('Not logged in');
    }
}

function updateUIForAuth() {
    if (currentUser) {
        btnLogin.style.display = 'none';
        btnRegister.style.display = 'none';
        userInfo.style.display = 'block';
        usernameDisplay.textContent = currentUser.username;
        roleDisplay.textContent = currentUser.role;
        
        if (currentUser.role === 'Client') {
            btnPostJob.style.display = 'block';
        } else {
            btnPostJob.style.display = 'none';
        }
    } else {
        btnLogin.style.display = 'inline-block';
        btnRegister.style.display = 'inline-block';
        userInfo.style.display = 'none';
        btnPostJob.style.display = 'none';
    }
}

// --- Categories ---

async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/categories/`);
        const data = await response.json();
        
        categoryList.innerHTML = '<li class="active" data-cat="">All Categories</li>';
        regCategory.innerHTML = '<option value="">Select Category</option>';
        
        data.categories.forEach(category => {
            // Sidebar
            const li = document.createElement('li');
            li.textContent = category;
            li.setAttribute('data-cat', category);
            li.onclick = () => {
                document.querySelectorAll('#category-list li').forEach(el => el.classList.remove('active'));
                li.classList.add('active');
                selectedCategory = category;
                refreshView();
            };
            categoryList.appendChild(li);

            // Register form
            const opt = document.createElement('option');
            opt.value = category;
            opt.textContent = category;
            regCategory.appendChild(opt);
        });

        categoryList.firstChild.onclick = () => {
            document.querySelectorAll('#category-list li').forEach(el => el.classList.remove('active'));
            categoryList.firstChild.classList.add('active');
            selectedCategory = '';
            refreshView();
        };
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// --- Views ---

function switchView(view) {
    currentView = view;
    viewFreelancers.classList.toggle('active', view === 'freelancers');
    viewJobs.classList.toggle('active', view === 'jobs');
    sectionTitle.textContent = view === 'freelancers' ? 'Freelancers' : 'Available Jobs';
    refreshView();
}

function refreshView() {
    if (currentView === 'freelancers') {
        loadFreelancers(selectedCategory);
    } else {
        loadJobs(selectedCategory);
    }
}

async function loadFreelancers(category) {
    try {
        mainGrid.innerHTML = '<p>Loading freelancers...</p>';
        const url = `${API_BASE_URL}/freelancers/` + (category ? `?category=${category}` : '');
        const response = await fetch(url);
        const data = await response.json();
        
        mainGrid.innerHTML = '';
        if (data.freelancers.length === 0) {
            mainGrid.innerHTML = '<p>No freelancers found in this category.</p>';
            return;
        }

        data.freelancers.forEach(f => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <h4>${f.name}</h4>
                <p class="meta">${f.category} | ${f.experience_years}y Exp</p>
                <p>${f.bio.substring(0, 100)}...</p>
            `;
            card.onclick = () => showFreelancerDetail(f.id);
            mainGrid.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading freelancers:', error);
        mainGrid.innerHTML = '<p>Error loading data.</p>';
    }
}

async function loadJobs(category) {
    try {
        mainGrid.innerHTML = '<p>Loading jobs...</p>';
        const url = `${API_BASE_URL}/jobs/` + (category ? `?category=${category}` : '');
        const response = await fetch(url);
        const data = await response.json();
        
        mainGrid.innerHTML = '';
        if (data.jobs.length === 0) {
            mainGrid.innerHTML = '<p>No jobs found in this category.</p>';
            return;
        }

        data.jobs.forEach(j => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <h4>${j.title}</h4>
                <p class="meta">$${j.budget} | ${j.category}</p>
                <p>${j.description.substring(0, 100)}...</p>
                <p style="margin-top: 10px; font-size: 0.8rem; color: #999;">Posted by ${j.client}</p>
            `;
            card.onclick = () => showJobDetail(j.id);
            mainGrid.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading jobs:', error);
        mainGrid.innerHTML = '<p>Error loading data.</p>';
    }
}

// --- Details ---

async function showFreelancerDetail(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/freelancers/${id}/`);
        const data = await response.json();
        
        modalBody.innerHTML = `
            <h2>${data.name}</h2>
            <p class="meta">${data.category} | ${data.experience_years} Years Experience</p>
            <p>${data.bio}</p>
            <hr>
            <h3>Portfolio Projects</h3>
            <div id="project-list">
                ${data.projects.length ? data.projects.map(p => `
                    <div class="project-item">
                        <h5>${p.title}</h5>
                        <p>${p.description}</p>
                    </div>
                `).join('') : '<p>No projects listed.</p>'}
            </div>
        `;
        detailModal.style.display = 'block';
    } catch (error) {
        console.error('Error loading freelancer detail:', error);
    }
}

async function showJobDetail(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/jobs/${id}/`);
        const data = await response.json();
        
        let bidsHtml = '';
        if (currentUser && currentUser.username === data.client) {
            bidsHtml = `
                <hr>
                <h3>Received Bids (${data.bid_count})</h3>
                <div id="bid-list">
                    ${data.bids.length ? data.bids.map(b => `
                        <div class="bid-item">
                            <h5>${b.freelancer} - $${b.amount}</h5>
                            <p>${b.proposal}</p>
                        </div>
                    `).join('') : '<p>No bids yet.</p>'}
                </div>
            `;
        } else if (currentUser && currentUser.role === 'Freelancer') {
            bidsHtml = `
                <hr>
                <h3>Place a Bid</h3>
                <form id="bid-form">
                    <input type="number" id="bid-amount" placeholder="Your Bid Amount ($)" required>
                    <textarea id="bid-proposal" placeholder="Your Proposal" required></textarea>
                    <button type="submit" class="btn btn-full">Submit Bid</button>
                </form>
            `;
        } else {
            bidsHtml = `<hr><p>${data.bid_count} bids placed. Login as a Freelancer to bid.</p>`;
        }

        modalBody.innerHTML = `
            <h2>${data.title}</h2>
            <p class="meta">$${data.budget} | ${data.category}</p>
            <p>${data.description}</p>
            <p style="font-size: 0.9rem; color: #666;">Posted by ${data.client}</p>
            ${bidsHtml}
        `;
        detailModal.style.display = 'block';

        // Setup bid form listener if exists
        const bidForm = document.getElementById('bid-form');
        if (bidForm) {
            bidForm.onsubmit = (e) => handlePlaceBid(e, id);
        }
    } catch (error) {
        console.error('Error loading job detail:', error);
    }
}

// --- Handlers ---

function setupEventListeners() {
    btnLogin.onclick = () => {
        authModal.style.display = 'block';
        loginFormDiv.style.display = 'block';
        registerFormDiv.style.display = 'none';
    };

    btnRegister.onclick = () => {
        authModal.style.display = 'block';
        loginFormDiv.style.display = 'none';
        registerFormDiv.style.display = 'block';
    };

    document.getElementById('go-to-register').onclick = (e) => {
        e.preventDefault();
        loginFormDiv.style.display = 'none';
        registerFormDiv.style.display = 'block';
    };

    document.getElementById('go-to-login').onclick = (e) => {
        e.preventDefault();
        loginFormDiv.style.display = 'block';
        registerFormDiv.style.display = 'none';
    };

    regRole.onchange = () => {
        freelancerFields.style.display = regRole.value === 'Freelancer' ? 'block' : 'none';
    };

    document.querySelectorAll('.close').forEach(btn => {
        btn.onclick = () => {
            authModal.style.display = 'none';
            detailModal.style.display = 'none';
        };
    });

    window.onclick = (event) => {
        if (event.target == authModal) authModal.style.display = 'none';
        if (event.target == detailModal) detailModal.style.display = 'none';
    };

    loginForm.onsubmit = handleLogin;
    registerForm.onsubmit = handleRegister;
    btnLogout.onclick = handleLogout;

    viewFreelancers.onclick = () => switchView('freelancers');
    viewJobs.onclick = () => switchView('jobs');
    btnPostJob.onclick = showPostJobForm;
}

async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    try {
        const res = await fetch(`${API_BASE_URL}/auth/login/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (res.ok) {
            currentUser = data;
            authModal.style.display = 'none';
            updateUIForAuth();
            refreshView();
        } else {
            alert(data.error);
        }
    } catch (err) {
        console.error(err);
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;
    const role = document.getElementById('reg-role').value;
    const category = document.getElementById('reg-category').value;
    const experience_years = document.getElementById('reg-experience').value;
    const bio = document.getElementById('reg-bio').value;

    try {
        const res = await fetch(`${API_BASE_URL}/auth/register/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, role, category, experience_years, bio })
        });
        const data = await res.json();
        if (res.ok) {
            currentUser = { username, role };
            authModal.style.display = 'none';
            updateUIForAuth();
            refreshView();
        } else {
            alert(data.error);
        }
    } catch (err) {
        console.error(err);
    }
}

async function handleLogout() {
    await fetch(`${API_BASE_URL}/auth/logout/`);
    currentUser = null;
    updateUIForAuth();
    refreshView();
}

function showPostJobForm() {
    modalBody.innerHTML = `
        <h2>Post a Job</h2>
        <form id="post-job-form">
            <input type="text" id="job-title" placeholder="Job Title" required>
            <textarea id="job-desc" placeholder="Job Description" required></textarea>
            <input type="number" id="job-budget" placeholder="Budget ($)" required>
            <select id="job-category" required>
                ${regCategory.innerHTML}
            </select>
            <button type="submit" class="btn btn-full">Post Job</button>
        </form>
    `;
    detailModal.style.display = 'block';
    document.getElementById('post-job-form').onsubmit = handlePostJob;
}

async function handlePostJob(e) {
    e.preventDefault();
    const title = document.getElementById('job-title').value;
    const description = document.getElementById('job-desc').value;
    const budget = document.getElementById('job-budget').value;
    const category = document.getElementById('job-category').value;

    try {
        const res = await fetch(`${API_BASE_URL}/jobs/create/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description, budget, category })
        });
        if (res.ok) {
            detailModal.style.display = 'none';
            switchView('jobs');
        } else {
            const data = await res.json();
            alert(data.error);
        }
    } catch (err) {
        console.error(err);
    }
}

async function handlePlaceBid(e, jobId) {
    e.preventDefault();
    const amount = document.getElementById('bid-amount').value;
    const proposal = document.getElementById('bid-proposal').value;

    try {
        const res = await fetch(`${API_BASE_URL}/jobs/${jobId}/bid/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount, proposal })
        });
        if (res.ok) {
            alert('Bid placed successfully!');
            showJobDetail(jobId);
        } else {
            const data = await res.json();
            alert(data.error);
        }
    } catch (err) {
        console.error(err);
    }
}

// Start
init();
