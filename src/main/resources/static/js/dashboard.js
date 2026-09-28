// FeedbackFlow - Dashboard JavaScript
// Handles fetching and displaying summary metrics and course list

document.addEventListener('DOMContentLoaded', () => {
    loadDashboard();
});

/**
 * Main function to load all dashboard components
 */
function loadDashboard() {
    hideError();
    fetchDashboardSummary();
    fetchCourses();
}

/**
 * Fetch dashboard summary statistics from /api/dashboard/summary
 */
function fetchDashboardSummary() {
    fetch('/api/dashboard/summary')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load dashboard summary (HTTP ' + response.status + ')');
            }
            return response.json();
        })
        .then(data => {
            // Update the 4 metric cards
            document.getElementById('stat-total-courses').textContent = data.totalCourses ?? 0;
            document.getElementById('stat-total-questions').textContent = data.totalQuestions ?? 0;
            document.getElementById('stat-total-feedback').textContent = data.totalFeedback ?? 0;

            const rating = (data.overallAverageRating !== undefined && data.overallAverageRating !== null)
                ? Number(data.overallAverageRating).toFixed(1)
                : '0.0';
            document.getElementById('stat-overall-rating').textContent = `${rating} / 5`;
        })
        .catch(error => {
            console.error('Error fetching dashboard summary:', error);
            showError('Unable to load dashboard statistics. Please ensure the backend is running.');
        });
}

/**
 * Fetch registered courses from /api/courses and populate the overview table
 */
function fetchCourses() {
    const tableBody = document.getElementById('courses-table-body');

    fetch('/api/courses')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load courses (HTTP ' + response.status + ')');
            }
            return response.json();
        })
        .then(courses => {
            tableBody.innerHTML = '';

            if (!courses || courses.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="4" class="table-empty-state">
                            <strong>No courses found</strong>
                            <p>Courses added to the system will appear here.</p>
                        </td>
                    </tr>
                `;
                return;
            }

            // Render each course row
            courses.forEach(course => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>
                        <span class="badge-code">${escapeHtml(course.courseCode || 'N/A')}</span>
                    </td>
                    <td>
                        <strong>${escapeHtml(course.courseName || 'Untitled Course')}</strong>
                    </td>
                    <td>
                        <span class="badge-dept">${escapeHtml(course.department || 'General')}</span>
                    </td>
                    <td style="text-align: right;">
                        <a href="results.html?courseId=${encodeURIComponent(course.id)}" class="btn-action">
                            View Feedback
                        </a>
                    </td>
                `;
                tableBody.appendChild(tr);
            });
        })
        .catch(error => {
            console.error('Error fetching courses:', error);
            tableBody.innerHTML = `
                <tr>
                    <td colspan="4" class="table-empty-state" style="color: #ef4444;">
                        Failed to load course list.
                    </td>
                </tr>
            `;
        });
}

/**
 * Helper to show an error message banner
 */
function showError(message) {
    const banner = document.getElementById('error-banner');
    const msgSpan = document.getElementById('error-message');
    if (banner && msgSpan) {
        msgSpan.textContent = message;
        banner.className = 'alert-banner error';
    }
}

/**
 * Helper to hide the error message banner
 */
function hideError() {
    const banner = document.getElementById('error-banner');
    if (banner) {
        banner.className = 'alert-banner';
    }
}

/**
 * Sanitize text to prevent HTML injection
 */
function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
