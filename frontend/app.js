const API_BASE_URL = 'https://freelancer-service-market-place.onrender.com/api';

const categoryList = document.getElementById('category-list');
const freelancerGrid = document.getElementById('freelancer-grid');
const categoryTitle = document.getElementById('category-title');
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modal-body');
const closeBtn = document.querySelector('.close');

// Load categories on start
async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/categories/`);
        const data = await response.json();
        
        categoryList.innerHTML = '';
        data.categories.forEach(category => {
            const li = document.createElement('li');
            li.textContent = category;
            li.onclick = () => {
                document.querySelectorAll('#category-list li').forEach(el => el.classList.remove('active'));
                li.classList.add('active');
                loadFreelancers(category);
            };
            categoryList.appendChild(li);
        });
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Load freelancers by category
async function loadFreelancers(category) {
    try {
        categoryTitle.textContent = `${category} Freelancers`;
        freelancerGrid.innerHTML = '<p>Loading...</p>';
        
        const response = await fetch(`${API_BASE_URL}/freelancers/?category=${category}`);
        const data = await response.json();
        
        freelancerGrid.innerHTML = '';
        data.freelancers.forEach(f => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <h4>${f.name}</h4>
                <p class="exp">${f.experience_years} Years Experience</p>
                <p>${f.bio.substring(0, 100)}...</p>
            `;
            card.onclick = () => showFreelancerDetail(f.id);
            freelancerGrid.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading freelancers:', error);
        freelancerGrid.innerHTML = '<p>Error loading freelancers. Please make sure the backend is running.</p>';
    }
}

// Show freelancer detail in modal
async function showFreelancerDetail(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/freelancers/${id}/`);
        const data = await response.json();
        
        modalBody.innerHTML = `
            <h2>${data.name}</h2>
            <p class="exp">${data.category} | ${data.experience_years} Years Experience</p>
            <p>${data.bio}</p>
            <hr>
            <h3>Previous Projects</h3>
            <div id="project-list">
                ${data.projects.map(p => `
                    <div class="project-item">
                        <h5>${p.title}</h5>
                        <p>${p.description}</p>
                    </div>
                `).join('')}
            </div>
        `;
        modal.style.display = 'block';
    } catch (error) {
        console.error('Error loading freelancer detail:', error);
    }
}

// Close modal
closeBtn.onclick = () => {
    modal.style.display = 'none';
};

window.onclick = (event) => {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
};

// Initial load
loadCategories();
