import {loadDashboard} from "./dashBoard.js"

function loginPage() {
    const content = document.getElementById('content');
    content.innerHTML = ''; // Clear the body content
    const loginContainer = document.createElement('div');
    loginContainer.id = 'login-container';
    content.appendChild(loginContainer);
    const loginForm = document.createElement('form');
    loginForm.id = 'login-form';
    loginForm.innerHTML = `
        <h2>Login</h2>
        <label for="username_or_email">Username or email:</label>
        <input type="text" id="username_or_email" name="username_or_email" required>
        <label for="password">Password:</label>
        <input type="password" id="password" name="password" required>
        <button type="submit">Login</button>
    `;

    const errorMessage = document.createElement('div');
    errorMessage.id = 'error-message';
    errorMessage.style.color = 'red';
    errorMessage.style.display = 'none'; // Initially hidden
    loginForm.appendChild(errorMessage);

    loginContainer.appendChild(loginForm);
    loginForm.addEventListener('submit', handleLogin);
}


async function handleLogin(event) {
    event.preventDefault(); // Prevent form submission

    const username_or_email = document.getElementById('username_or_email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');

    
    const credentials = btoa(`${username_or_email}:${password}`);

    try {
        const response = await fetch('https://zone01normandie.org/api/auth/signin', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/json',
            }
        });

        
        if (!response.ok) {
            errorMessage.innerText = result.message || 'Login failed';
            errorMessage.style.display = 'block'; // Show error message
            return;
        }
        
        const token = await response.json();
        localStorage.setItem('token', token); // Store the token in local storage
    
        loadDashboard();

    } catch (error) {
        errorMessage.innerText = error.message || 'An error occurred';
        errorMessage.style.display = 'block'; // Show error message
    }
}


export { loginPage };
