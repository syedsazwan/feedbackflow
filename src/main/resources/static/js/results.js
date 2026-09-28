// FeedbackFlow - Feedback Results JavaScript
// Handles loading course list, fetching question-wise averages, and computing overall ratings

let allCourses = [];

document.addEventListener('DOMContentLoaded', () => {
    initResultsPage();
});

/**
 * Initialize page: fetch courses and check if a course is pre-selected via URL
 */
function initResultsPage() {
    hideError();
    loadCoursesDropdown();
}

/**
 * Fetch courses from /api/courses and populate the selector
 */
function loadCoursesDropdown() {
    const courseSelect = document.getElementById('course-select');
    const urlParams = new URLSearchParams(window.location.search);
    const preselectedCourseId = urlParams.get('courseId');

    fetch('/api/courses')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load courses (HTTP ' + response.status + ')');
            }
            return response.json();
        })
        .then(courses => {
            allCourses = courses || [];
            courseSelect.innerHTML = '<option value="" disabled selected>-- Select a Course --</option>';

            if (allCourses.length === 0) {
                courseSelect.innerHTML = '<option value="" disabled>No courses registered yet</option>';
                showError('No courses found in the system.');
                return;
            }

            allCourses.forEach(course => {
                const option = document.createElement('option');
                option.value = course.id;
                option.textContent = `${course.courseCode} - ${course.courseName} (${course.department})`;

                if (preselectedCourseId && String(course.id) === String(preselectedCourseId)) {
                    option.selected = true;
                }

                courseSelect.appendChild(option);
            });

            // If preselected from URL, automatically fetch its feedback results
            if (preselectedCourseId && allCourses.some(c => String(c.id) === String(preselectedCourseId))) {
                onCourseSelected();
            }
        })
        .catch(error => {
            console.error('Error fetching courses:', error);
            courseSelect.innerHTML = '<option value="" disabled>Error loading courses</option>';
            showError('Unable to load courses from the backend.');
        });
}

/**
 * Triggered when a course is chosen from the dropdown
 */
function onCourseSelected() {
    hideError();
    const courseSelect = document.getElementById('course-select');
    const courseId = courseSelect.value;

    if (!courseId) return;

    // Find course details
    const selectedCourse = allCourses.find(c => String(c.id) === String(courseId));
    if (selectedCourse) {
        document.getElementById('display-course-code').textContent = selectedCourse.courseCode || 'N/A';
        document.getElementById('display-course-name').textContent = selectedCourse.courseName || 'Untitled Course';
        document.getElementById('display-course-dept').textContent = selectedCourse.department || 'General';
    }

    fetchCourseAverages(courseId);
}

/**
 * Fetch question averages for the chosen course from /api/feedback/course/{courseId}/averages
 */
function fetchCourseAverages(courseId) {
    const displayArea = document.getElementById('results-display-area');
    const placeholder = document.getElementById('initial-placeholder');
    const tableBody = document.getElementById('results-table-body');

    // Show results container
    displayArea.style.display = 'block';
    placeholder.style.display = 'none';

    tableBody.innerHTML = `
        <tr>
            <td colspan="4" class="table-empty-state">
                Calculating feedback results...
            </td>
        </tr>
    `;

    fetch(`/api/feedback/course/${encodeURIComponent(courseId)}/averages`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load feedback results (HTTP ' + response.status + ')');
            }
            return response.json();
        })
        .then(averages => {
            tableBody.innerHTML = '';

            // Handle empty feedback state
            if (!averages || averages.length === 0) {
                document.getElementById('display-overall-rating').textContent = 'N/A';
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="4" class="table-empty-state">
                            <strong>No feedback data available for this course.</strong>
                            <p style="margin-top: 6px;">Students have not yet submitted evaluations for this course.</p>
                        </td>
                    </tr>
                `;
                return;
            }

            // Calculate overall course average from question averages
            let totalRatingSum = 0;
            averages.forEach(item => {
                totalRatingSum += Number(item.averageRating || 0);
            });
            const overallAverage = totalRatingSum / averages.length;
            const roundedOverall = (Math.round(overallAverage * 10) / 10).toFixed(1);

            document.getElementById('display-overall-rating').textContent = `${roundedOverall} / 5`;

            // Populate table rows
            averages.forEach((item, index) => {
                const tr = document.createElement('tr');
                const avg = Number(item.averageRating || 0);
                const avgFormatted = (Math.round(avg * 10) / 10).toFixed(1);
                const percent = Math.min(100, Math.max(0, (avg / 5) * 100));

                // Determine bar color intensity
                let fillClass = 'medium';
                if (avg >= 4.0) fillClass = 'high';
                else if (avg < 2.5) fillClass = 'low';

                tr.innerHTML = `
                    <td>
                        <span class="badge-code">Q${index + 1}</span>
                    </td>
                    <td>
                        <strong>${escapeHtml(item.questionText || 'Evaluation Question')}</strong>
                    </td>
                    <td>
                        <div class="rating-progress-wrapper">
                            <div class="progress-track">
                                <div class="progress-fill ${fillClass}" style="width: ${percent}%;"></div>
                            </div>
                            <span class="rating-score-pill">${avgFormatted}</span>
                        </div>
                    </td>
                    <td style="text-align: right; font-weight: 600;">
                        ${avgFormatted} / 5
                    </td>
                `;
                tableBody.appendChild(tr);
            });
        })
        .catch(error => {
            console.error('Error fetching course averages:', error);
            showError('Unable to load feedback results for this course.');
            tableBody.innerHTML = `
                <tr>
                    <td colspan="4" class="table-empty-state" style="color: #ef4444;">
                        Failed to load question ratings.
                    </td>
                </tr>
            `;
        });
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
        banner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
