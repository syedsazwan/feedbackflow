// FeedbackFlow - Student Management JavaScript
// Handles fetching, creating, updating, searching, and deleting students

let allStudents = [];

document.addEventListener('DOMContentLoaded', () => {
    loadStudents();
});

/**
 * Fetch all students from /api/students
 */
function loadStudents() {
    hideMessages();

    fetch('/api/students')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load students (HTTP ' + response.status + ')');
            }
            return response.json();
        })
        .then(students => {
            allStudents = students || [];
            renderStudentsTable(allStudents);
        })
        .catch(error => {
            console.error('Error fetching students:', error);
            showError('Unable to load students from the backend.');
            renderStudentsTable([]);
        });
}

/**
 * Filter students using search input (register number or student name)
 */
function filterStudentsTable() {
    const searchVal = (document.getElementById('student-search-input')?.value || '').toLowerCase().trim();

    const filtered = allStudents.filter(student => {
        const matchesReg = student.registerNumber && student.registerNumber.toLowerCase().includes(searchVal);
        const matchesName = student.studentName && student.studentName.toLowerCase().includes(searchVal);
        return !searchVal || matchesReg || matchesName;
    });

    renderStudentsTable(filtered);
}

/**
 * Render filtered or full students array into the table
 */
function renderStudentsTable(students) {
    const tableBody = document.getElementById('students-table-body');
    const badge = document.getElementById('student-total-badge');

    if (badge) {
        badge.textContent = `Total: ${students.length} Students`;
    }

    if (!tableBody) return;
    tableBody.innerHTML = '';

    if (!students || students.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" class="table-empty-state">
                    <strong>No students found</strong>
                    <p style="margin-top: 4px;">Use the form above to add a student.</p>
                </td>
            </tr>
        `;
        return;
    }

    students.forEach(student => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><span style="font-weight: 600; color: var(--text-secondary);">#${student.id}</span></td>
            <td>
                <span class="badge-code">${escapeHtml(student.registerNumber || '')}</span>
            </td>
            <td>
                <strong style="color: var(--text-primary);">${escapeHtml(student.studentName || '')}</strong>
            </td>
            <td style="text-align: right;">
                <div class="btn-group" style="justify-content: flex-end;">
                    <button class="btn-outline-blue" onclick="startEditStudent(${student.id})">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                        Edit
                    </button>
                    <button class="btn-outline-red" onclick="deleteStudent(${student.id}, '${escapeHtml(student.registerNumber)}')">
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
 * Handle form submission for adding or updating a student
 */
function handleStudentSubmit(event) {
    event.preventDefault();
    hideMessages();

    const studentId = document.getElementById('student-id').value;
    const registerNumber = document.getElementById('register-number').value.trim();
    const studentName = document.getElementById('student-name').value.trim();

    if (!registerNumber || !studentName) {
        showError('Please fill in both Register Number and Student Name.');
        return;
    }

    const payload = {
        registerNumber: registerNumber,
        studentName: studentName
    };

    const submitBtn = document.getElementById('btn-student-submit');
    if (submitBtn) submitBtn.disabled = true;

    const isEdit = Boolean(studentId);
    const url = isEdit ? `/api/students/${studentId}` : '/api/students';
    const method = isEdit ? 'PUT' : 'POST';

    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
        .then(async response => {
            if (!response.ok) {
                let errorMsg = 'Failed to save student.';
                try {
                    const errorData = await response.json();
                    if (errorData && errorData.message) {
                        errorMsg = errorData.message;
                    }
                } catch (jsonErr) {
                    errorMsg = response.statusText || errorMsg;
                }
                throw new Error(errorMsg);
            }
            return response.json();
        })
        .then(savedStudent => {
            showSuccess(isEdit ? 'Student updated successfully.' : 'Student added successfully.');
            cancelEdit();
            loadStudents();
        })
        .catch(error => {
            console.error('Save error:', error);
            showError(error.message || 'Error occurred while saving student.');
        })
        .finally(() => {
            if (submitBtn) submitBtn.disabled = false;
        });
}

/**
 * Populate form to start editing a student
 */
function startEditStudent(id) {
    const student = allStudents.find(s => s.id === id);
    if (!student) return;

    document.getElementById('student-id').value = student.id;
    document.getElementById('register-number').value = student.registerNumber || '';
    document.getElementById('student-name').value = student.studentName || '';

    document.getElementById('form-title').textContent = 'Edit Student';
    document.getElementById('btn-submit-text').textContent = 'Update Student';
    document.getElementById('btn-cancel-edit').style.display = 'inline-flex';

    document.getElementById('form-section').scrollIntoView({ behavior: 'smooth' });
}

/**
 * Reset form back to Add Student mode
 */
function cancelEdit() {
    document.getElementById('student-form').reset();
    document.getElementById('student-id').value = '';

    document.getElementById('form-title').textContent = 'Add Student';
    document.getElementById('btn-submit-text').textContent = 'Add Student';
    document.getElementById('btn-cancel-edit').style.display = 'none';
}

/**
 * Delete a student
 */
function deleteStudent(id, regNum) {
    if (!confirm(`Are you sure you want to delete student ${regNum}?`)) {
        return;
    }

    hideMessages();

    fetch(`/api/students/${id}`, {
        method: 'DELETE'
    })
        .then(async response => {
            if (!response.ok) {
                let errorMsg = 'Failed to delete student.';
                try {
                    const errorData = await response.json();
                    if (errorData && errorData.message) {
                        errorMsg = errorData.message;
                    }
                } catch (e) {
                    errorMsg = response.statusText || errorMsg;
                }
                throw new Error(errorMsg);
            }
            showSuccess('Student deleted successfully.');
            if (document.getElementById('student-id').value === String(id)) {
                cancelEdit();
            }
            loadStudents();
        })
        .catch(error => {
            console.error('Delete error:', error);
            showError(error.message || 'Error occurred while deleting student.');
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
 * Hide all notification banners
 */
function hideMessages() {
    const errorBanner = document.getElementById('error-banner');
    const successBanner = document.getElementById('success-banner');
    if (errorBanner) errorBanner.className = 'alert-banner';
    if (successBanner) successBanner.style.display = 'none';
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
