// FeedbackFlow - Dashboard JavaScript
// Fetches real dashboard statistics, course performance metrics, and portal overview

document.addEventListener('DOMContentLoaded', () => {
    loadDashboard();
});

/**
 * Main dashboard data loader
 */
function loadDashboard() {
    hideError();
    fetchDashboardSummary();
    fetchCoursePerformance();
}

/**
 * Fetch summary statistics from /api/dashboard/summary
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
            const totalCourses = data.totalCourses ?? 0;
            const totalQuestions = data.totalQuestions ?? 0;
            const totalFeedback = data.totalFeedback ?? 0;
            const avgRating = (data.overallAverageRating !== undefined && data.overallAverageRating !== null)
                ? Number(data.overallAverageRating).toFixed(1)
                : '0.0';

            // 4 Top Metric Cards
            document.getElementById('stat-total-courses').textContent = totalCourses;
            document.getElementById('stat-total-questions').textContent = totalQuestions;
            document.getElementById('stat-total-feedback').textContent = totalFeedback;
            document.getElementById('stat-overall-rating').textContent = `${avgRating} / 5`;

            // Secondary Section: System Information
            const studentsEl = document.getElementById('stat-total-students');
            const semestersEl = document.getElementById('stat-total-semesters');
            const openSemestersEl = document.getElementById('stat-open-semesters');
            if (studentsEl) studentsEl.textContent = data.totalStudents ?? 0;
            if (semestersEl) semestersEl.textContent = data.totalSemesters ?? 0;
            if (openSemestersEl) openSemestersEl.textContent = data.openSemesters ?? 0;

            // System Overview Side Panel
            document.getElementById('overview-courses').textContent = `${totalCourses} Registered`;
            document.getElementById('overview-questions').textContent = `${totalQuestions} Active`;
            document.getElementById('overview-feedback').textContent = `${totalFeedback} Submissions`;
            document.getElementById('overview-rating').textContent = `${avgRating} / 5`;
        })
        .catch(error => {
            console.error('Error fetching dashboard summary:', error);
            showError('Unable to load dashboard statistics. Please ensure the backend is running.');
        });
}

/**
 * Fetch courses and their individual feedback averages to build Course Performance rows
 */
function fetchCoursePerformance() {
    const container = document.getElementById('course-perf-container');

    fetch('/api/courses')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load courses (HTTP ' + response.status + ')');
            }
            return response.json();
        })
        .then(courses => {
            if (!courses || courses.length === 0) {
                container.innerHTML = `
                    <div class="table-empty-state">
                        <strong>No courses found</strong>
                        <p style="margin-top: 4px;">Register courses to view performance data.</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = '';

            // For each course, fetch its question averages asynchronously
            const coursePromises = courses.map(course => {
                return fetch(`/api/feedback/course/${encodeURIComponent(course.id)}/averages`)
                    .then(res => res.ok ? res.json() : [])
                    .then(averages => {
                        let avgScore = null;
                        if (averages && averages.length > 0) {
                            const sum = averages.reduce((acc, curr) => acc + Number(curr.averageRating || 0), 0);
                            avgScore = sum / averages.length;
                        }
                        return { course, avgScore };
                    })
                    .catch(() => ({ course, avgScore: null }));
            });

            Promise.all(coursePromises).then(results => {
                container.innerHTML = '';
                results.forEach(({ course, avgScore }) => {
                    const row = document.createElement('div');
                    row.className = 'course-perf-row';

                    const hasRating = avgScore !== null && !isNaN(avgScore);
                    const formattedScore = hasRating ? (Math.round(avgScore * 10) / 10).toFixed(1) : null;
                    const percent = hasRating ? Math.min(100, Math.max(0, (avgScore / 5) * 100)) : 0;

                    row.innerHTML = `
                        <div class="perf-col-left">
                            <span class="badge-code">${escapeHtml(course.courseCode || 'N/A')}</span>
                            <span class="perf-course-name" title="${escapeHtml(course.courseName || '')}">${escapeHtml(course.courseName || 'Untitled Course')}</span>
                            <span class="badge-dept">${escapeHtml(course.department || 'General')}</span>
                        </div>
                        <div class="perf-col-middle">
                            <div class="perf-meter-track">
                                <div class="perf-meter-fill" style="width: ${percent}%;"></div>
                            </div>
                            <span class="perf-score-text">
                                ${hasRating ? `${formattedScore} / 5` : '<span class="perf-no-feedback">No feedback</span>'}
                            </span>
                        </div>
                        <div class="perf-col-right">
                            <a href="results.html?courseId=${encodeURIComponent(course.id)}" class="btn-action" title="View detailed feedback report">
                                View Results
                            </a>
                        </div>
                    `;
                    container.appendChild(row);
                });
            });
        })
        .catch(error => {
            console.error('Error fetching course performance:', error);
            container.innerHTML = `
                <div class="table-empty-state" style="color: var(--danger);">
                    Failed to load course performance.
                </div>
            `;
        });
}

/**
 * Show error banner
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
 * Hide error banner
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
