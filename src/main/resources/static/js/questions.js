// FeedbackFlow - Question Management JavaScript
// Handles adding, updating, listing, filtering, and deleting questions

let allQuestions = [];

document.addEventListener('DOMContentLoaded', () => {
    loadQuestions();
});

/**
 * Fetch all evaluation questions from /api/questions
 */
function loadQuestions() {
    const tableBody = document.getElementById('questions-table-body');

    fetch('/api/questions')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load questions (HTTP ' + response.status + ')');
            }
            return response.json();
        })
        .then(questions => {
            allQuestions = questions || [];
            renderQuestionsTable(allQuestions);
        })
        .catch(error => {
            console.error('Error fetching questions:', error);
            showError('Unable to load questions from the backend.');
            tableBody.innerHTML = `
                <tr>
                    <td colspan="3" class="table-empty-state" style="color: var(--danger);">
                        Failed to load questions. Please check server connection.
                    </td>
                </tr>
            `;
        });
}

/**
 * Filter questions based on search input
 */
function filterQuestionsTable() {
    const searchVal = (document.getElementById('question-search-input')?.value || '').toLowerCase().trim();

    const filtered = allQuestions.filter(q => {
        return !searchVal || (q.questionText && q.questionText.toLowerCase().includes(searchVal));
    });

    renderQuestionsTable(filtered);
}

/**
 * Render questions into the table
 */
function renderQuestionsTable(questions) {
    const tableBody = document.getElementById('questions-table-body');
    const badge = document.getElementById('question-total-badge');

    if (badge) {
        badge.textContent = `Total: ${questions.length} Questions`;
    }

    tableBody.innerHTML = '';

    if (!questions || questions.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="3" class="table-empty-state">
                    <strong>No evaluation questions found</strong>
                    <p style="margin-top: 4px;">Use the form above to add a new question.</p>
                </td>
            </tr>
        `;
        return;
    }

    questions.forEach(q => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><span style="font-weight: 600; color: var(--text-secondary);">#${q.id}</span></td>
            <td>
                <strong style="color: var(--text-primary); font-size: 13.5px;">${escapeHtml(q.questionText || '')}</strong>
            </td>
            <td style="text-align: right;">
                <div class="btn-group">
                    <button class="btn-outline-blue" onclick="startEditQuestion(${q.id})">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                        Edit
                    </button>
                    <button class="btn-outline-red" onclick="deleteQuestion(${q.id})">
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
 * Handle form submission for adding or updating a question
 */
function handleQuestionSubmit(event) {
    event.preventDefault();
    hideMessages();

    const questionId = document.getElementById('question-id').value;
    const questionText = document.getElementById('question-text').value.trim();

    if (!questionText) {
        showError('Please enter question text.');
        return;
    }

    const payload = {
        questionText: questionText
    };

    const submitBtn = document.getElementById('btn-question-submit');
    submitBtn.disabled = true;

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
            showSuccess(`Question ${actionMsg} successfully.`);
            cancelEdit();
            loadQuestions();
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
    const question = allQuestions.find(q => Number(q.id) === Number(id));
    if (!question) return;

    document.getElementById('question-id').value = question.id;
    document.getElementById('question-text').value = question.questionText || '';

    document.getElementById('form-title').textContent = 'Edit Question #' + question.id;
    document.getElementById('btn-submit-text').textContent = 'Update Question';
    document.getElementById('btn-cancel-edit').style.display = 'inline-flex';

    scrollToForm();
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
 * Helper to smoothly scroll to form
 */
function scrollToForm() {
    document.getElementById('form-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
    document.getElementById('question-text').focus();
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
            showSuccess(msg || 'Question deleted successfully.');
            if (document.getElementById('question-id').value === String(id)) {
                cancelEdit();
            }
            loadQuestions();
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
