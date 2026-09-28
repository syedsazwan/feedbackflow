// FeedbackFlow - Feedback Results JavaScript
// Fetches real question averages, computes overall rating, and maps score status badges

let allCourses = [];

document.addEventListener('DOMContentLoaded', () => {
    initResultsPage();
});

/**
 * Initialize page: load courses and check URL parameters
 */
function initResultsPage() {
    hideError();
    loadCoursesDropdown();
}

/**
 * Fetch courses from /api/courses
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
            courseSelect.innerHTML = '<option value="" disabled selected>-- Select Course --</option>';

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
 * Triggered on course dropdown change
 */
function onCourseSelected() {
    hideError();
    const courseSelect = document.getElementById('course-select');
    const courseId = courseSelect.value;
    if (!courseId) return;

    // Display course details
    const selectedCourse = allCourses.find(c => String(c.id) === String(courseId));
    const metaCard = document.getElementById('course-meta-details');
    if (selectedCourse && metaCard) {
        document.getElementById('display-course-code').textContent = selectedCourse.courseCode || '';
        document.getElementById('display-course-name').textContent = selectedCourse.courseName || '';
        document.getElementById('display-course-dept').textContent = selectedCourse.department || '';
        metaCard.style.display = 'block';
    }

    fetchCourseAverages(courseId);
}

/**
 * Fetch question averages from /api/feedback/course/{id}/averages
 */
function fetchCourseAverages(courseId) {
    const tableBody = document.getElementById('results-table-body');

    tableBody.innerHTML = `
        <tr>
            <td colspan="5" class="table-empty-state">
                <span class="loading-spinner" style="border-top-color: var(--primary); border-color: rgba(37, 99, 235, 0.2); margin-right: 8px;"></span>
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

            // Handle empty responses
            if (!averages || averages.length === 0) {
                document.getElementById('display-overall-rating').textContent = 'N/A';
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="5" class="table-empty-state">
                            <strong>No feedback data available for this course.</strong>
                            <p style="margin-top: 4px;">Students have not yet submitted feedback evaluations for this course.</p>
                        </td>
                    </tr>
                `;
                return;
            }

            // Calculate overall course average on frontend
            let sum = 0;
            averages.forEach(item => {
                sum += Number(item.averageRating || 0);
            });
            const overall = sum / averages.length;
            const roundedOverall = (Math.round(overall * 10) / 10).toFixed(1);

            document.getElementById('display-overall-rating').textContent = `${roundedOverall} / 5`;

            // Render question rows
            averages.forEach((item, index) => {
                const tr = document.createElement('tr');
                const avg = Number(item.averageRating || 0);
                const avgFormatted = (Math.round(avg * 10) / 10).toFixed(1);
                const percent = Math.min(100, Math.max(0, (avg / 5) * 100));

                const statusInfo = getStatusInfo(avg);

                tr.innerHTML = `
                    <td><span class="badge-code">Q${index + 1}</span></td>
                    <td>
                        <strong style="color: var(--text-primary); font-size: 13.5px;">${escapeHtml(item.questionText || '')}</strong>
                    </td>
                    <td>
                        <div class="results-meter-wrap">
                            <div class="results-meter-track">
                                <div class="results-meter-fill ${statusInfo.className}" style="width: ${percent}%;"></div>
                            </div>
                            <span style="font-size: 12.5px; font-weight: 700; color: var(--text-primary); min-width: 32px;">${avgFormatted}</span>
                        </div>
                    </td>
                    <td style="font-weight: 700; color: var(--text-primary);">
                        ${avgFormatted} / 5
                    </td>
                    <td style="text-align: right;">
                        <span class="status-badge ${statusInfo.className}">
                            ${statusInfo.label}
                        </span>
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
                    <td colspan="5" class="table-empty-state" style="color: var(--danger);">
                        Failed to load question ratings.
                    </td>
                </tr>
            `;
        });
}

/**
 * Status mapping based on real average score:
 * 4.5–5.0 = Excellent
 * 3.5–4.49 = Very Good
 * 2.5–3.49 = Good
 * 1.5–2.49 = Fair
 * Below 1.5 = Poor
 */
function getStatusInfo(rating) {
    if (rating >= 4.5) {
        return { label: 'Excellent', className: 'excellent' };
    } else if (rating >= 3.5) {
        return { label: 'Very Good', className: 'verygood' };
    } else if (rating >= 2.5) {
        return { label: 'Good', className: 'good' };
    } else if (rating >= 1.5) {
        return { label: 'Fair', className: 'fair' };
    } else {
        return { label: 'Poor', className: 'poor' };
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
