// FeedbackFlow - Login JavaScript Logic
// Handles client-side authentication and redirection

document.addEventListener('DOMContentLoaded', () => {
    // If user is already logged in, redirect directly to dashboard
    if (localStorage.getItem('feedbackflowLoggedIn') === 'true') {
        window.location.href = 'index.html';
    }
});

/**
 * Handle login submission
 */
function handleLogin(event) {
    event.preventDefault();
    hideError();

    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    // Validation
    if (!username) {
        showError('Please enter username.');
        usernameInput.focus();
        return;
    }

    if (!password) {
        showError('Please enter password.');
        passwordInput.focus();
        return;
    }

    // Both are entered: login succeeds
    localStorage.setItem('feedbackflowLoggedIn', 'true');
    localStorage.setItem('feedbackflowUsername', username);
    window.location.href = 'index.html';
}

/**
 * Show error banner
 */
function showError(message) {
    const banner = document.getElementById('error-banner');
    const msg = document.getElementById('error-message');
    if (banner && msg) {
        msg.textContent = message;
        banner.className = 'alert-banner error';
    }
}

/**
 * Hide error banner
 */
function hideError() {
    const banner = document.getElementById('error-banner');
    if (banner) {
        banner.className = 'alert-banner';
    }
}
