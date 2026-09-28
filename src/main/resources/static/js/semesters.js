// FeedbackFlow - Semester Management JavaScript
// Handles semester CRUD, open/close feedback controls, and real-time status display

let allSemesters = [];

document.addEventListener('DOMContentLoaded', () => {
    loadSemesters();
});

/**
 * Fetch all semesters and their real-time submission status
 */
function loadSemesters() {
    hideMessages();

    fetch('/api/semesters')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load semesters (HTTP ' + response.status + ')');
            }
            return response.json();
        })
        .then(async semesters => {
            const rawSemesters = semesters || [];

            // Fetch /api/semesters/{id}/status for each semester in parallel
            const enriched = await Promise.all(rawSemesters.map(async sem => {
                try {
                    const statusRes = await fetch(`/api/semesters/${sem.id}/status`);
                    if (statusRes.ok) {
                        const statusData = await statusRes.json();
                        return {
                            ...sem,
                            submissionAllowed: statusData.submissionAllowed
                        };
                    }
                } catch (e) {
                    console.warn(`Could not fetch status for semester ${sem.id}:`, e);
                }
                return {
                    ...sem,
                    submissionAllowed: sem.feedbackOpen
                };
            }));

            allSemesters = enriched;
            renderSemestersTable(allSemesters);
        })
        .catch(error => {
            console.error('Error fetching semesters:', error);
            showError('Unable to load semesters from the backend.');
            renderSemestersTable([]);
        });
}

/**
 * Filter semesters using search input
 */
function filterSemestersTable() {
    const searchVal = (document.getElementById('semester-search-input')?.value || '').toLowerCase().trim();

    const filtered = allSemesters.filter(sem => {
        return !searchVal || (sem.semesterName && sem.semesterName.toLowerCase().includes(searchVal));
    });

    renderSemestersTable(filtered);
}

/**
 * Render semesters array into table
 */
function renderSemestersTable(semesters) {
    const tableBody = document.getElementById('semesters-table-body');
    const badge = document.getElementById('semester-total-badge');

    if (badge) {
        badge.textContent = `Total: ${semesters.length} Semesters`;
    }

    if (!tableBody) return;
    tableBody.innerHTML = '';

    if (!semesters || semesters.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="table-empty-state">
                    <strong>No semesters found</strong>
                    <p style="margin-top: 4px;">Use the form above to add a semester.</p>
                </td>
            </tr>
        `;
        return;
    }

    semesters.forEach(sem => {
        const tr = document.createElement('tr');

        const isOpen = Boolean(sem.feedbackOpen);
        const statusBadgeClass = isOpen ? 'status-badge open' : 'status-badge closed';
        const statusText = isOpen ? 'OPEN' : 'CLOSED';

        const isAllowed = Boolean(sem.submissionAllowed);
        const allowedBadgeClass = isAllowed ? 'status-badge allowed' : 'status-badge notallowed';
        const allowedText = isAllowed ? 'ALLOWED' : 'NOT ALLOWED';

        const deadlineText = sem.feedbackDeadline ? sem.feedbackDeadline : '<span style="color: var(--text-muted);">None</span>';

        tr.innerHTML = `
            <td><span style="font-weight: 600; color: var(--text-secondary);">#${sem.id}</span></td>
            <td>
                <strong style="color: var(--text-primary); font-size: 14px;">${escapeHtml(sem.semesterName || '')}</strong>
            </td>
            <td>${deadlineText}</td>
            <td>
                <span class="${statusBadgeClass}">${statusText}</span>
            </td>
            <td>
                <span class="${allowedBadgeClass}">${allowedText}</span>
            </td>
            <td style="text-align: right;">
                <div class="btn-group" style="justify-content: flex-end;">
                    <button class="btn-outline-blue" onclick="startEditSemester(${sem.id})">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                        Edit
                    </button>
                    ${isOpen ? `
                        <button class="btn-outline-red" onclick="closeSemesterFeedback(${sem.id})">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                            Close
                        </button>
                    ` : `
                        <button class="btn-outline-green" onclick="openSemesterFeedback(${sem.id})">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            Open
                        </button>
                    `}
                    <button class="btn-outline-red" onclick="deleteSemester(${sem.id}, '${escapeHtml(sem.semesterName)}')">
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
 * Handle form submission for adding or updating a semester
 */
function handleSemesterSubmit(event) {
    event.preventDefault();
    hideMessages();

    const semesterId = document.getElementById('semester-id').value;
    const semesterName = document.getElementById('semester-name').value.trim();
    const feedbackDeadline = document.getElementById('feedback-deadline').value || null;
    const feedbackOpen = document.getElementById('feedback-open').value === 'true';

    if (!semesterName) {
        showError('Please enter a semester name.');
        return;
    }

    const payload = {
        semesterName: semesterName,
        feedbackDeadline: feedbackDeadline,
        feedbackOpen: feedbackOpen
    };

    const submitBtn = document.getElementById('btn-semester-submit');
    if (submitBtn) submitBtn.disabled = true;

    const isEdit = Boolean(semesterId);
    const url = isEdit ? `/api/semesters/${semesterId}` : '/api/semesters';
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
                let errorMsg = 'Failed to save semester.';
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
        .then(savedSemester => {
            showSuccess(isEdit ? 'Semester updated successfully.' : 'Semester added successfully.');
            cancelEdit();
            loadSemesters();
        })
        .catch(error => {
            console.error('Save error:', error);
            showError(error.message || 'Error occurred while saving semester.');
        })
        .finally(() => {
            if (submitBtn) submitBtn.disabled = false;
        });
}

/**
 * Open feedback collection for a semester
 */
function openSemesterFeedback(id) {
    hideMessages();

    fetch(`/api/semesters/${id}/open`, {
        method: 'PUT'
    })
        .then(async response => {
            if (!response.ok) {
                let errorMsg = 'Failed to open feedback collection.';
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
            return response.json();
        })
        .then(() => {
            showSuccess('Feedback collection opened successfully.');
            loadSemesters();
        })
        .catch(error => {
            console.error('Open error:', error);
            showError(error.message || 'Failed to open feedback collection.');
        });
}

/**
 * Close feedback collection for a semester
 */
function closeSemesterFeedback(id) {
    hideMessages();

    fetch(`/api/semesters/${id}/close`, {
        method: 'PUT'
    })
        .then(async response => {
            if (!response.ok) {
                let errorMsg = 'Failed to close feedback collection.';
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
            return response.json();
        })
        .then(() => {
            showSuccess('Feedback collection closed successfully.');
            loadSemesters();
        })
        .catch(error => {
            console.error('Close error:', error);
            showError(error.message || 'Failed to close feedback collection.');
        });
}

/**
 * Populate form to start editing a semester
 */
function startEditSemester(id) {
    const sem = allSemesters.find(s => s.id === id);
    if (!sem) return;

    document.getElementById('semester-id').value = sem.id;
    document.getElementById('semester-name').value = sem.semesterName || '';
    document.getElementById('feedback-deadline').value = sem.feedbackDeadline || '';
    document.getElementById('feedback-open').value = String(Boolean(sem.feedbackOpen));

    document.getElementById('form-title').textContent = 'Edit Semester';
    document.getElementById('btn-submit-text').textContent = 'Update Semester';
    document.getElementById('btn-cancel-edit').style.display = 'inline-flex';

    document.getElementById('form-section').scrollIntoView({ behavior: 'smooth' });
}

/**
 * Reset form back to Add Semester mode
 */
function cancelEdit() {
    document.getElementById('semester-form').reset();
    document.getElementById('semester-id').value = '';
    document.getElementById('feedback-open').value = 'true';

    document.getElementById('form-title').textContent = 'Add Semester';
    document.getElementById('btn-submit-text').textContent = 'Add Semester';
    document.getElementById('btn-cancel-edit').style.display = 'none';
}

/**
 * Delete a semester
 */
function deleteSemester(id, name) {
    if (!confirm(`Are you sure you want to delete semester "${name}"?`)) {
        return;
    }

    hideMessages();

    fetch(`/api/semesters/${id}`, {
        method: 'DELETE'
    })
        .then(async response => {
            if (!response.ok) {
                let errorMsg = 'Failed to delete semester.';
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
            showSuccess('Semester deleted successfully.');
            if (document.getElementById('semester-id').value === String(id)) {
                cancelEdit();
            }
            loadSemesters();
        })
        .catch(error => {
            console.error('Delete error:', error);
            showError(error.message || 'Error occurred while deleting semester.');
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
