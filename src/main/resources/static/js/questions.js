// FeedbackFlow - Question Management JavaScript
// Handles adding, updating, listing, and deleting feedback evaluation questions

let questionsList = [];

document.addEventListener('DOMContentLoaded', () => {
    loadQuestionsTable();
});

/**
 * Fetch all evaluation questions from /api/questions and populate table
 */
function loadQuestionsTable() {
    const tableBody = document.getElementById('questions-table-body');

    fetch('/api/questions')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load questions (HTTP ' + response.status + ')');
            }
            return response.json();
        })
        .then(questions => {
            questionsList = questions || [];
            tableBody.innerHTML = '';

            if (questionsList.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="3" class="table-empty-state">
                            <strong>No evaluation questions found</strong>
                            <p style="margin-top: 6px;">Use the form above to add a new question.</p>
                        </td>
                    </tr>
                `;
                return;
            }

            questionsList.forEach(q => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>#${q.id}</strong></td>
                    <td>
                        <strong>${escapeHtml(q.questionText || '')}</strong>
                    </td>
                    <td style="text-align: right;">
                        <div class="btn-group">
                            <button class="btn-edit" onclick="startEditQuestion(${q.id})">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                                Edit
                            </button>
                            <button class="btn-delete" onclick="deleteQuestion(${q.id})">
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
            console.error('Error fetching questions:', error);
            showError('Unable to load questions from the backend.');
            tableBody.innerHTML = `
                <tr>
                    <td colspan="3" class="table-empty-state" style="color: #ef4444;">
                        Failed to load questions. Please check server connection.
                    </td>
                </tr>
            `;
        });
}

/**
 * Handle form submission for adding or updating a question
 */
function handleQuestionSubmit(event) {
    event.preventDefault();
    hideMessages();

    const questionId = document.getElementById('question-id').value;
    const questionText = document.getElementById('question-text').value.trim();

    // Validation
    if (!questionText) {
        showError('Please enter question text.');
        return;
    }

    const payload = {
        questionText: questionText
    };

    const submitBtn = document.getElementById('btn-question-submit');
    submitBtn.disabled = true;

    // Determine if creating (POST) or updating (PUT)
    const isEditMode = Boolean(questionId);
    const url = isEditMode ? `/api/questions/${encodeURIComponent(questionId)}` : '/api/questions';
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
                throw new Error('Failed to save question (HTTP ' + response.status + ')');
            }
            return response.json();
        })
        .then(savedQuestion => {
            const actionMsg = isEditMode ? 'updated' : 'added';
            showSuccess(`Question ${actionMsg} successfully!`);
            cancelEdit();
            loadQuestionsTable();
        })
        .catch(error => {
            console.error('Error saving question:', error);
            showError('Failed to save question. Please try again.');
        })
        .finally(() => {
            submitBtn.disabled = false;
        });
}

/**
 * Populate form for editing existing question
 */
function startEditQuestion(id) {
    hideMessages();
    const question = questionsList.find(q => Number(q.id) === Number(id));
    if (!question) return;

    document.getElementById('question-id').value = question.id;
    document.getElementById('question-text').value = question.questionText || '';

    document.getElementById('form-title').textContent = 'Edit Question #' + question.id;
    document.getElementById('btn-submit-text').textContent = 'Update Question';
    document.getElementById('btn-cancel-edit').style.display = 'inline-flex';

    // Scroll to form
    document.getElementById('form-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Cancel edit mode and reset form to "Add Feedback Question"
 */
function cancelEdit() {
    document.getElementById('question-form').reset();
    document.getElementById('question-id').value = '';
    document.getElementById('form-title').textContent = 'Add Feedback Question';
    document.getElementById('btn-submit-text').textContent = 'Add Question';
    document.getElementById('btn-cancel-edit').style.display = 'none';
}

/**
 * Delete a question by id with confirmation
 */
function deleteQuestion(id) {
    hideMessages();

    const confirmed = confirm(`Are you sure you want to delete question #${id}?`);
    if (!confirmed) return;

    fetch(`/api/questions/${encodeURIComponent(id)}`, {
        method: 'DELETE'
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete question (HTTP ' + response.status + ')');
            }
            return response.text();
        })
        .then(msg => {
            showSuccess(msg || 'Question deleted successfully!');
            if (document.getElementById('question-id').value === String(id)) {
                cancelEdit();
            }
            loadQuestionsTable();
        })
        .catch(error => {
            console.error('Error deleting question:', error);
            showError('Unable to delete question. It may be linked to submitted feedback evaluations.');
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
