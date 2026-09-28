// FeedbackFlow - Authentication Guard & Session Management
// Ensures only authenticated users access protected pages and updates user profile in header

(function checkAuth() {
    const isLoggedIn = localStorage.getItem('feedbackflowLoggedIn');
    if (isLoggedIn !== 'true') {
        window.location.href = 'login.html';
    }
})();

/**
 * Global logout function used across all sidebar logout buttons
 */
function logout() {
    localStorage.removeItem('feedbackflowLoggedIn');
    localStorage.removeItem('feedbackflowUsername');
    window.location.href = 'login.html';
}

/**
 * Automatically populates the header profile with the active username and avatar letter
 */
document.addEventListener('DOMContentLoaded', () => {
    const rawUsername = localStorage.getItem('feedbackflowUsername') || 'Admin';
    const cleanUsername = rawUsername.trim() || 'Admin';
    const firstLetter = cleanUsername.charAt(0).toUpperCase();

    const nameElements = document.querySelectorAll('.header-user-name');
    nameElements.forEach(el => {
        el.textContent = cleanUsername;
    });

    const avatarElements = document.querySelectorAll('.header-user-avatar');
    avatarElements.forEach(el => {
        el.textContent = firstLetter;
    });
});
