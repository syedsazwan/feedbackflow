// FeedbackFlow - Authentication Guard & Session Management
// Ensures that only logged-in users can access protected system pages

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
    window.location.href = 'login.html';
}
