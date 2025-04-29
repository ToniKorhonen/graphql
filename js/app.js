import { loadLayout } from './layout.js';
import { loadDashboard } from './dashBoard.js';
import { loginPage } from './login.js';

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    loadLayout();
    const token = localStorage.getItem('token');
    if (token) {
        loadDashboard();
    } else {
        loginPage();
    }
}