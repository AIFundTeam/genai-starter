// Simple user management without authentication
let currentUser = null;

// Get or create user
function initUser() {
    const savedEmail = localStorage.getItem('userEmail');
    if (savedEmail) {
        currentUser = savedEmail;
        updateUserDisplay();
    } else {
        // Redirect to login page (now index.html)
        window.location.href = 'index.html';
    }
}

// Update UI with current user
function updateUserDisplay() {
    const userDisplay = document.getElementById('current-user');
    if (userDisplay) {
        userDisplay.textContent = currentUser;
    }
    
    // Dispatch event so other parts of app know user is ready
    document.dispatchEvent(new CustomEvent('user-ready', { 
        detail: { email: currentUser } 
    }));
}

// Logout function
window.logout = function() {
    localStorage.removeItem('userEmail');
    currentUser = null;
    window.location.href = 'index.html';
};

// Get current user
window.getCurrentUser = () => currentUser;

// Initialize on page load
document.addEventListener('DOMContentLoaded', initUser);