// FeedbackFlow - Submit Feedback JavaScript
// Handles course selection details, dynamic question rendering, real-time progress, and submission

let coursesData = [];
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
 * Load courses from /api/courses
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
            coursesData = courses || [];
            courseSelect.innerHTML = '<option value="" disabled selected>-- Select a Course --</option>';

            if (coursesData.length === 0) {
                courseSelect.innerHTML = '<option value="" disabled>No courses registered yet</option>';
                showError('No courses found. Please register courses before submitting feedback.');
                return;
            }

            coursesData.forEach(course => {
                const option = document.createElement('option');
                option.value = course.id;
                option.textContent = `${course.courseCode} - ${course.courseName} (${course.department})`;

                if (preselectedCourseId && String(course.id) === String(preselectedCourseId)) {
                    option.selected = true;
                }

                courseSelect.appendChild(option);
            });

            // Update course details card if preselected
            if (preselectedCourseId) {
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
 * Update course preview card when selected
 */
function onCourseSelected() {
    const courseSelect = document.getElementById('course-select');
    const courseId = courseSelect.value;
    const card = document.getElementById('course-info-card');

    const course = coursesData.find(c => String(c.id) === String(courseId));
    if (course && card) {
        document.getElementById('info-course-code').textContent = course.courseCode || '';
        document.getElementById('info-course-name').textContent = course.courseName || '';
        document.getElementById('info-course-dept').textContent = course.department || '';
        card.style.display = 'block';
    } else if (card) {
        card.style.display = 'none';
    }
}

/**
 * Load questions from /api/questions and render the 1-5 rating cards
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

            updateProgressBar();

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
                            <input type="radio" id="${inputId}" name="question_${q.id}" value="${label.val}" onchange="updateProgressBar()" required>
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

            updateProgressBar();
        })
        .catch(error => {
            console.error('Error fetching questions:', error);
            container.innerHTML = `
                <div class="content-card" style="padding: 32px; text-align: center; color: var(--danger);">
                    Failed to load evaluation questions. Please try again.
                </div>
            `;
            showError('Unable to load evaluation questions from the server.');
        });
}

/**
 * Calculate and update real-time questions answered progress bar
 */
function updateProgressBar() {
    const total = questionsData.length;
    let answered = 0;

    questionsData.forEach(q => {
        const checked = document.querySelector(`input[name="question_${q.id}"]:checked`);
        if (checked) answered++;
    });

    const pct = total > 0 ? Math.round((answered / total) * 100) : 0;

    const textEl = document.getElementById('progress-text');
    const pctEl = document.getElementById('progress-pct');
    const fillEl = document.getElementById('progress-bar-fill');

    if (textEl) textEl.textContent = `${answered} / ${total}`;
    if (pctEl) pctEl.textContent = `${pct}%`;
    if (fillEl) fillEl.style.width = `${pct}%`;
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

    // Collect ratings
    const ratings = [];
    for (let i = 0; i < questionsData.length; i++) {
        const q = questionsData[i];
        const selected = document.querySelector(`input[name="question_${q.id}"]:checked`);
        if (!selected) {
            showError(`Please answer all questions before submitting (missing Question #${i + 1}).`);
            return;
        }
        ratings.push({
            questionId: Number(q.id),
            rating: Number(selected.value)
        });
    }

    const payload = {
        courseId: Number(courseId),
        ratings: ratings
    };

    const submitBtn = document.getElementById('btn-submit');
    submitBtn.disabled = true;

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
            showSuccess('Feedback submitted successfully. Thank you for evaluating this course.');
            resetForm();
        })
        .catch(error => {
            console.error('Submission error:', error);
            showError('Failed to submit feedback. Please check your connection and try again.');
        })
        .finally(() => {
            submitBtn.disabled = false;
        });
}

/**
 * Reset form fields and progress bar
 */
function resetForm() {
    const form = document.getElementById('feedback-form');
    if (form) {
        form.reset();
    }
    const card = document.getElementById('course-info-card');
    if (card) {
        card.style.display = 'none';
    }
    updateProgressBar();
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
