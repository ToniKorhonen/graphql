import { fetchGraphql } from './fetchGraphql.js';
import { loadXPgraph } from './xpgraph.js';
import { loadXPOverTime } from './xpovertime.js';

// dashboard.js
async function loadDashboard() {
    // Header
    const title = document.getElementById('title');
    title.innerText = 'Student Dashboard';

    const header = document.getElementById('header');
    let logoutButton = document.getElementById('logout-btn');
    if (!logoutButton) {
        logoutButton = document.createElement('button');
        logoutButton.id = 'logout-btn';
        logoutButton.innerText = 'Logout';
        logoutButton.onclick = () => {
            localStorage.removeItem('token');
            location.reload(); // Reset to login screen
        };
        header.appendChild(logoutButton);
    }

    // Content
    const content = document.getElementById('content');
    content.innerHTML = ''; // Clear previous content (like login form)

    const welcome = document.createElement('h2');
    welcome.innerText = 'Welcome to your dashboard!';

    const profile = document.createElement('p');
    profile.id = 'profile-data'; // ID for future reference
    
    content.appendChild(welcome);
    content.appendChild(profile);

    // Fetch user data
    const query = `{
        user {
            auditRatio
            id
            login
            createdAt
            campus
        }
    }`
    const data = await fetchGraphql(query);
    loadProfile(data);
    loadXPgraph(data);
    loadXPOverTime(data);


    // Footer
    const footer = document.querySelector('footer p');
    footer.innerText = '© 2025 Graphql, creator: Toni Korhonen';
}


async function loadProfile(data) {
    const profile = document.getElementById('profile-data');
    const username = document.createElement('p');
    username.innerText = `Username: ${data.user[0].login}`;
    console.log(username);
    const auditRatio = document.createElement('p')
    auditRatio.innerText = `Audit Ratio: ${data.user[0].auditRatio.toFixed(1)}`
    const createdAt = document.createElement('p')
    createdAt.innerText = `Created At: ${new Date(data.user[0].createdAt).toLocaleDateString()}`
    const campus = document.createElement('p')
    campus.innerText = `Campus: ${data.user[0].campus}`
    profile.appendChild(campus);
    profile.appendChild(createdAt);
    profile.appendChild(username);
    profile.appendChild(auditRatio)
}


export { loadDashboard };
