// FeedbackFlow - Faculty Summary JavaScript
// Fetches course-wise feedback performance summaries and displays aggregate evaluation metrics

let courseSummaries = [];

document.addEventListener('DOMContentLoaded', () => {
    loadFacultySummary();
});

/**
 * Fetch course feedback summaries from /api/faculty/summary
 */
function loadFacultySummary() {
    hideError();

    fetch('/api/faculty/summary')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load faculty summary (HTTP ' + response.status + ')');
            }
            return response.json();
        })
        .then(data => {
            courseSummaries = data || [];
            updateSummaryMetrics(courseSummaries);
            renderSummaryTable(courseSummaries);
        })
        .catch(error => {
            console.error('Error fetching faculty summary:', error);
            showError('Unable to load faculty feedback summary from the backend.');
            renderSummaryTable([]);
        });
}

/**
 * Calculate and update top summary cards from real summary data array
 */
function updateSummaryMetrics(summaries) {
    const totalCourses = summaries.length;
    let coursesWithFeedback = 0;
    let totalFeedbackResponses = 0;
    let sumAverageRatings = 0;

    summaries.forEach(s => {
        const feedbackCount = Number(s.totalFeedback || 0);
        const rating = Number(s.averageRating || 0);

        if (feedbackCount > 0) {
            coursesWithFeedback++;
            sumAverageRatings += rating;
        }
        totalFeedbackResponses += feedbackCount;
    });

    const overallCourseAvg = coursesWithFeedback > 0
        ? (sumAverageRatings / coursesWithFeedback).toFixed(1)
        : '0.0';

    document.getElementById('stat-total-courses').textContent = totalCourses;
    document.getElementById('stat-courses-with-feedback').textContent = coursesWithFeedback;
    document.getElementById('stat-total-responses').textContent = totalFeedbackResponses;
    document.getElementById('stat-overall-average').textContent = `${overallCourseAvg} / 5`;

    const badge = document.getElementById('summary-total-badge');
    if (badge) {
        badge.textContent = `Total: ${totalCourses} Courses`;
    }
}

/**
 * Determine rating status badge and label based on numeric value
 */
function getRatingStatus(rating, totalFeedback) {
    if (!totalFeedback || totalFeedback === 0 || rating === 0) {
        return { text: 'No Feedback', cssClass: 'status-badge nofeedback' };
    }
    if (rating >= 4.5) {
        return { text: 'Excellent', cssClass: 'status-badge excellent' };
    }
    if (rating >= 3.5) {
        return { text: 'Very Good', cssClass: 'status-badge verygood' };
    }
    if (rating >= 2.5) {
        return { text: 'Good', cssClass: 'status-badge good' };
    }
    if (rating >= 1.5) {
        return { text: 'Fair', cssClass: 'status-badge fair' };
    }
    return { text: 'Poor', cssClass: 'status-badge poor' };
}

/**
 * Render course feedback summary table
 */
function renderSummaryTable(summaries) {
    const tableBody = document.getElementById('faculty-summary-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    if (!summaries || summaries.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="table-empty-state">
                    <strong>No course feedback summaries found</strong>
                    <p style="margin-top: 4px;">Registered courses and student feedback will appear here.</p>
                </td>
            </tr>
        `;
        return;
    }

    summaries.forEach(item => {
        const tr = document.createElement('tr');
        const status = getRatingStatus(item.averageRating, item.totalFeedback);
        const avgText = (item.totalFeedback > 0 && item.averageRating > 0)
            ? `${Number(item.averageRating).toFixed(1)} / 5`
            : '<span style="color: var(--text-muted);">0.0 / 5</span>';

        tr.innerHTML = `
            <td>
                <span class="badge-code">${escapeHtml(item.courseCode || '')}</span>
            </td>
            <td>
                <strong style="color: var(--text-primary); font-size: 14px;">${escapeHtml(item.courseName || '')}</strong>
            </td>
            <td>
                <span class="badge-dept">${escapeHtml(item.department || '')}</span>
            </td>
            <td style="text-align: center; font-weight: 600; color: var(--text-primary);">
                ${item.totalFeedback}
            </td>
            <td style="text-align: center; font-weight: 700; color: var(--text-primary);">
                ${avgText}
            </td>
            <td style="text-align: center;">
                <span class="${status.cssClass}">${status.text}</span>
            </td>
            <td style="text-align: right;">
                <button class="btn-action" onclick="viewCourseDetails(${item.courseId})">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    View Details
                </button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

/**
 * View single course details by calling GET /api/faculty/summary/{courseId}
 */
function viewCourseDetails(courseId) {
    hideError();

    fetch(`/api/faculty/summary/${courseId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load course details (HTTP ' + response.status + ')');
            }
            return response.json();
        })
        .then(course => {
            const section = document.getElementById('details-section');
            if (!section) return;

            document.getElementById('detail-course-code').textContent = course.courseCode || '';
            document.getElementById('detail-course-name').textContent = course.courseName || '';
            document.getElementById('detail-department').textContent = course.department || '';

            document.getElementById('detail-total-feedback').textContent = course.totalFeedback;
            document.getElementById('detail-average-rating').textContent = `${Number(course.averageRating).toFixed(1)} / 5`;

            const status = getRatingStatus(course.averageRating, course.totalFeedback);
            const statusBadge = document.getElementById('detail-status-badge');
            statusBadge.className = status.cssClass;
            statusBadge.textContent = status.text;

            const pct = Math.min(100, Math.round((Number(course.averageRating) / 5) * 100));
            document.getElementById('detail-progress-pct').textContent = `${pct}%`;
            document.getElementById('detail-meter-fill').style.width = `${pct}%`;

            section.style.display = 'block';
            section.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        })
        .catch(error => {
            console.error('Error fetching course details:', error);
            showError('Unable to load course summary details.');
        });
}

/**
 * Close course details card
 */
function closeDetails() {
    const section = document.getElementById('details-section');
    if (section) {
        section.style.display = 'none';
    }
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

/**
 * Helper to escape HTML characters
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
