// FeedbackFlow - Course Management JavaScript
// Handles adding, updating, listing, filtering, and deleting courses

let allCourses = [];

document.addEventListener('DOMContentLoaded', () => {
    loadCourses();
});

/**
 * Fetch all registered courses from /api/courses
 */
function loadCourses() {
    const tableBody = document.getElementById('courses-table-body');

    fetch('/api/courses')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load courses (HTTP ' + response.status + ')');
            }
            return response.json();
        })
        .then(courses => {
            allCourses = courses || [];
            updateDeptFilterOptions();
            renderCoursesTable(allCourses);
        })
        .catch(error => {
            console.error('Error fetching courses:', error);
            showError('Unable to load courses from the backend.');
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="table-empty-state" style="color: var(--danger);">
                        Failed to load courses. Please check server connection.
                    </td>
                </tr>
            `;
        });
}

/**
 * Populate department dropdown filter with unique departments
 */
function updateDeptFilterOptions() {
    const select = document.getElementById('dept-filter-select');
    if (!select) return;

    const currentVal = select.value;
    const depts = Array.from(new Set(allCourses.map(c => (c.department || '').trim()).filter(Boolean))).sort();

    select.innerHTML = '<option value="">All Departments</option>';
    depts.forEach(d => {
        const opt = document.createElement('option');
        opt.value = d;
        opt.textContent = d;
        if (d === currentVal) opt.selected = true;
        select.appendChild(opt);
    });
}

/**
 * Filter courses using search input and department filter
 */
function filterCoursesTable() {
    const searchVal = (document.getElementById('course-search-input')?.value || '').toLowerCase().trim();
    const deptVal = document.getElementById('dept-filter-select')?.value || '';

    const filtered = allCourses.filter(course => {
        const matchesSearch = !searchVal ||
            (course.courseCode && course.courseCode.toLowerCase().includes(searchVal)) ||
            (course.courseName && course.courseName.toLowerCase().includes(searchVal)) ||
            (course.department && course.department.toLowerCase().includes(searchVal));

        const matchesDept = !deptVal || (course.department && course.department.trim() === deptVal.trim());

        return matchesSearch && matchesDept;
    });

    renderCoursesTable(filtered);
}

/**
 * Render filtered or full courses array into the table
 */
function renderCoursesTable(courses) {
    const tableBody = document.getElementById('courses-table-body');
    const badge = document.getElementById('course-total-badge');

    if (badge) {
        badge.textContent = `Total: ${courses.length} Courses`;
    }

    tableBody.innerHTML = '';

    if (!courses || courses.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="table-empty-state">
                    <strong>No courses found</strong>
                    <p style="margin-top: 4px;">Use the form above to add a course.</p>
                </td>
            </tr>
        `;
        return;
    }

    courses.forEach((course, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><span style="font-weight: 600; color: var(--text-secondary);">#${course.id}</span></td>
            <td>
                <span class="badge-code">${escapeHtml(course.courseCode || '')}</span>
            </td>
            <td>
                <strong style="color: var(--text-primary);">${escapeHtml(course.courseName || '')}</strong>
            </td>
            <td>
                <span class="badge-dept">${escapeHtml(course.department || '')}</span>
            </td>
            <td style="text-align: right;">
                <div class="btn-group">
                    <button class="btn-outline-blue" onclick="startEditCourse(${course.id})">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                        Edit
                    </button>
                    <button class="btn-outline-red" onclick="deleteCourse(${course.id}, '${escapeHtml(course.courseCode)}')">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        Delete
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(tr);
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
            showSuccess(`Course "${savedCourse.courseCode} - ${savedCourse.courseName}" ${actionMsg} successfully.`);
            cancelEdit();
            loadCourses();
        })
        .catch(error => {
            console.error('Error saving course:', error);
            showError('Failed to save course. Please verify input.');
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
    const course = allCourses.find(c => Number(c.id) === Number(id));
    if (!course) return;

    document.getElementById('course-id').value = course.id;
    document.getElementById('course-code').value = course.courseCode || '';
    document.getElementById('course-name').value = course.courseName || '';
    document.getElementById('department').value = course.department || '';

    document.getElementById('form-title').textContent = 'Edit Course #' + course.id;
    document.getElementById('btn-submit-text').textContent = 'Update Course';
    document.getElementById('btn-cancel-edit').style.display = 'inline-flex';

    scrollToForm();
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
 * Helper to smoothly scroll to form
 */
function scrollToForm() {
    document.getElementById('form-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
    document.getElementById('course-code').focus();
}

/**
 * Delete a course by id with confirmation
 */
function deleteCourse(id, courseCode) {
    hideMessages();

    const confirmed = confirm(`Are you sure you want to delete course "${courseCode}"?`);
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
            showSuccess(msg || 'Course deleted successfully.');
            if (document.getElementById('course-id').value === String(id)) {
                cancelEdit();
            }
            loadCourses();
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
