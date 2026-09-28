// FeedbackFlow - Submit Feedback JavaScript
// Handles loading courses, questions, and submitting student evaluations

let questionsData = [];

document.addEventListener('DOMContentLoaded', () => {
    initFeedbackForm();
});

/**
 * Initialize page by fetching courses and evaluation questions
 */
function initFeedbackForm() {
    hideMessages();
    loadCourses();
    loadQuestions();
}

/**
 * Load courses from /api/courses to populate the dropdown
 */
function loadCourses() {
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
            courseSelect.innerHTML = '<option value="" disabled selected>-- Select a Course --</option>';

            if (!courses || courses.length === 0) {
                courseSelect.innerHTML = '<option value="" disabled>No courses registered yet</option>';
                showError('No courses found. Please register courses before submitting feedback.');
                return;
            }

            courses.forEach(course => {
                const option = document.createElement('option');
                option.value = course.id;
                option.textContent = `${course.courseCode} - ${course.courseName} (${course.department})`;

                if (preselectedCourseId && String(course.id) === String(preselectedCourseId)) {
                    option.selected = true;
                }

                courseSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error fetching courses:', error);
            courseSelect.innerHTML = '<option value="" disabled>Error loading courses</option>';
            showError('Unable to load courses from the backend.');
        });
}

/**
 * Load questions from /api/questions and render the 1-5 rating UI
 */
function loadQuestions() {
    const container = document.getElementById('questions-container');

    fetch('/api/questions')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load questions (HTTP ' + response.status + ')');
            }
            return response.json();
        })
        .then(questions => {
            questionsData = questions || [];
            container.innerHTML = '';

            if (questionsData.length === 0) {
                container.innerHTML = `
                    <div class="content-card" style="padding: 32px; text-align: center; color: var(--text-secondary);">
                        No feedback questions found in the system.
                    </div>
                `;
                return;
            }

            const ratingLabels = [
                { val: 1, text: 'Poor' },
                { val: 2, text: 'Fair' },
                { val: 3, text: 'Good' },
                { val: 4, text: 'Very Good' },
                { val: 5, text: 'Excellent' }
            ];

            questionsData.forEach((q, index) => {
                const questionCard = document.createElement('div');
                questionCard.className = 'question-item';

                let ratingOptionsHtml = '';
                ratingLabels.forEach(label => {
                    const inputId = `rating_${q.id}_${label.val}`;
                    ratingOptionsHtml += `
                        <label class="rating-option" for="${inputId}">
                            <input type="radio" id="${inputId}" name="question_${q.id}" value="${label.val}" required>
                            <div class="rating-box">
                                <span class="rating-number">${label.val}</span>
                                <span class="rating-text">${label.text}</span>
                            </div>
                        </label>
                    `;
                });

                questionCard.innerHTML = `
                    <div class="question-header">
                        <span class="question-num">Q${index + 1}</span>
                        <div class="question-title">${escapeHtml(q.questionText)}</div>
                    </div>
                    <div class="rating-group">
                        ${ratingOptionsHtml}
                    </div>
                `;

                container.appendChild(questionCard);
            });
        })
        .catch(error => {
            console.error('Error fetching questions:', error);
            container.innerHTML = `
                <div class="content-card" style="padding: 32px; text-align: center; color: #ef4444;">
                    Failed to load evaluation questions. Please try again.
                </div>
            `;
            showError('Unable to load evaluation questions from the server.');
        });
}

/**
 * Handle form submission
 */
function handleFeedbackSubmit(event) {
    event.preventDefault();
    hideMessages();

    const courseSelect = document.getElementById('course-select');
    const courseId = courseSelect.value;

    if (!courseId) {
        showError('Please select a course to submit feedback.');
        courseSelect.focus();
        return;
    }

    if (!questionsData || questionsData.length === 0) {
        showError('Cannot submit feedback: No questions available.');
        return;
    }

    // Collect ratings for all questions
    const ratings = [];
    for (const q of questionsData) {
        const selectedRatingInput = document.querySelector(`input[name="question_${q.id}"]:checked`);
        if (!selectedRatingInput) {
            showError(`Please answer all questions before submitting (missing Question #${questionsData.indexOf(q) + 1}).`);
            return;
        }
        ratings.push({
            questionId: Number(q.id),
            rating: Number(selectedRatingInput.value)
        });
    }

    const payload = {
        courseId: Number(courseId),
        ratings: ratings
    };

    const submitBtn = document.getElementById('btn-submit');
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Submitting...';

    fetch('/api/feedback', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Server returned error (HTTP ' + response.status + ')');
            }
            return response.json();
        })
        .then(savedFeedback => {
            showSuccess(`Feedback successfully submitted for course! Evaluation recorded.`);
            resetForm();
        })
        .catch(error => {
            console.error('Submission error:', error);
            showError('Failed to submit feedback. Please verify your connection and try again.');
        })
        .finally(() => {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>Submit Feedback</span>
            `;
        });
}

/**
 * Reset form fields
 */
function resetForm() {
    const form = document.getElementById('feedback-form');
    if (form) {
        form.reset();
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
