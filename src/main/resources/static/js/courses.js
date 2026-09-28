// FeedbackFlow - Course Management JavaScript
// Handles adding, updating, listing, and deleting courses

let coursesList = [];

document.addEventListener('DOMContentLoaded', () => {
    loadCoursesTable();
});

/**
 * Fetch all registered courses from /api/courses and populate table
 */
function loadCoursesTable() {
    const tableBody = document.getElementById('courses-table-body');

    fetch('/api/courses')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load courses (HTTP ' + response.status + ')');
            }
            return response.json();
        })
        .then(courses => {
            coursesList = courses || [];
            tableBody.innerHTML = '';

            if (coursesList.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="5" class="table-empty-state">
                            <strong>No courses registered yet</strong>
                            <p style="margin-top: 6px;">Use the form above to add your first course.</p>
                        </td>
                    </tr>
                `;
                return;
            }

            coursesList.forEach(course => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>#${course.id}</strong></td>
                    <td>
                        <span class="badge-code">${escapeHtml(course.courseCode || '')}</span>
                    </td>
                    <td>
                        <strong>${escapeHtml(course.courseName || '')}</strong>
                    </td>
                    <td>
                        <span class="badge-dept">${escapeHtml(course.department || '')}</span>
                    </td>
                    <td style="text-align: right;">
                        <div class="btn-group">
                            <button class="btn-edit" onclick="startEditCourse(${course.id})">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                                Edit
                            </button>
                            <button class="btn-delete" onclick="deleteCourse(${course.id}, '${escapeHtml(course.courseCode)}')">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                Delete
                            </button>
                        </div>
                    </td>
                `;
                tableBody.appendChild(tr);
            });
        })
        .catch(error => {
            console.error('Error fetching courses:', error);
            showError('Unable to load courses from the backend.');
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="table-empty-state" style="color: #ef4444;">
                        Failed to load courses. Please check server connection.
                    </td>
                </tr>
            `;
        });
}

/**
 * Handle form submission for adding or updating a course
 */
function handleCourseSubmit(event) {
    event.preventDefault();
    hideMessages();

    const courseId = document.getElementById('course-id').value;
    const courseCode = document.getElementById('course-code').value.trim();
    const courseName = document.getElementById('course-name').value.trim();
    const department = document.getElementById('department').value.trim();

    // Validation
    if (!courseCode || !courseName || !department) {
        showError('Please fill in all required fields (Course Code, Name, and Department).');
        return;
    }

    const payload = {
        courseCode: courseCode,
        courseName: courseName,
        department: department
    };

    const submitBtn = document.getElementById('btn-course-submit');
    submitBtn.disabled = true;

    // Check if creating (POST) or updating (PUT)
    const isEditMode = Boolean(courseId);
    const url = isEditMode ? `/api/courses/${encodeURIComponent(courseId)}` : '/api/courses';
    const method = isEditMode ? 'PUT' : 'POST';

    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to save course (HTTP ' + response.status + ')');
            }
            return response.json();
        })
        .then(savedCourse => {
            const actionMsg = isEditMode ? 'updated' : 'added';
            showSuccess(`Course "${savedCourse.courseCode} - ${savedCourse.courseName}" ${actionMsg} successfully!`);
            cancelEdit();
            loadCoursesTable();
        })
        .catch(error => {
            console.error('Error saving course:', error);
            showError('Failed to save course. Please try again.');
        })
        .finally(() => {
            submitBtn.disabled = false;
        });
}

/**
 * Populate form for editing existing course
 */
function startEditCourse(id) {
    hideMessages();
    const course = coursesList.find(c => Number(c.id) === Number(id));
    if (!course) return;

    document.getElementById('course-id').value = course.id;
    document.getElementById('course-code').value = course.courseCode || '';
    document.getElementById('course-name').value = course.courseName || '';
    document.getElementById('department').value = course.department || '';

    document.getElementById('form-title').textContent = 'Edit Course #' + course.id;
    document.getElementById('btn-submit-text').textContent = 'Update Course';
    document.getElementById('btn-cancel-edit').style.display = 'inline-flex';

    // Scroll to form
    document.getElementById('form-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Cancel edit mode and reset form to "Add New Course"
 */
function cancelEdit() {
    document.getElementById('course-form').reset();
    document.getElementById('course-id').value = '';
    document.getElementById('form-title').textContent = 'Add New Course';
    document.getElementById('btn-submit-text').textContent = 'Add Course';
    document.getElementById('btn-cancel-edit').style.display = 'none';
}

/**
 * Delete a course by id with confirmation
 */
function deleteCourse(id, courseCode) {
    hideMessages();

    const confirmed = confirm(`Are you sure you want to delete course "${courseCode}"? This will remove related records.`);
    if (!confirmed) return;

    fetch(`/api/courses/${encodeURIComponent(id)}`, {
        method: 'DELETE'
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete course (HTTP ' + response.status + ')');
            }
            return response.text();
        })
        .then(msg => {
            showSuccess(msg || 'Course deleted successfully!');
            // If the deleted course was currently in edit mode, cancel edit
            if (document.getElementById('course-id').value === String(id)) {
                cancelEdit();
            }
            loadCoursesTable();
        })
        .catch(error => {
            console.error('Error deleting course:', error);
            showError('Unable to delete course. It may have associated feedback responses.');
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
 * Show success banner
 */
function showSuccess(message) {
    const banner = document.getElementById('success-banner');
    const msg = document.getElementById('success-message');
    if (banner && msg) {
        msg.textContent = message;
        banner.style.display = 'flex';
        banner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

/**
 * Hide notification banners
 */
function hideMessages() {
    const errorBanner = document.getElementById('error-banner');
    const successBanner = document.getElementById('success-banner');
    if (errorBanner) errorBanner.className = 'alert-banner';
    if (successBanner) successBanner.style.display = 'none';
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
