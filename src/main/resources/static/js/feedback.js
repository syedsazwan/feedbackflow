// FeedbackFlow - Submit Feedback JavaScript
// Handles Student, Semester, and Course selection, dynamic question rendering, real-time progress, and submission

let studentsData = [];
let semestersData = [];
let coursesData = [];
let questionsData = [];

document.addEventListener('DOMContentLoaded', () => {
    initFeedbackForm();
});

/**
 * Initialize page by fetching students, semesters, courses and evaluation questions
 */
function initFeedbackForm() {
    hideMessages();
    loadStudents();
    loadSemesters();
    loadCourses();
    loadQuestions();
}

/**
 * Load students from /api/students
 */
function loadStudents() {
    const studentSelect = document.getElementById('student-select');
    if (!studentSelect) return;

    fetch('/api/students')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load students (HTTP ' + response.status + ')');
            }
            return response.json();
        })
        .then(students => {
            studentsData = students || [];
            studentSelect.innerHTML = '<option value="" disabled selected>-- Select Student --</option>';

            if (studentsData.length === 0) {
                studentSelect.innerHTML = '<option value="" disabled>No students registered yet</option>';
                return;
            }

            studentsData.forEach(student => {
                const option = document.createElement('option');
                option.value = student.id;
                option.textContent = `${student.registerNumber} - ${student.studentName}`;
                studentSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error fetching students:', error);
            studentSelect.innerHTML = '<option value="" disabled>Error loading students</option>';
            showError('Unable to load students from the backend.');
        });
}

/**
 * Load semesters from /api/semesters
 */
function loadSemesters() {
    const semesterSelect = document.getElementById('semester-select');
    if (!semesterSelect) return;

    fetch('/api/semesters')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load semesters (HTTP ' + response.status + ')');
            }
            return response.json();
        })
        .then(semesters => {
            semestersData = semesters || [];
            semesterSelect.innerHTML = '<option value="" disabled selected>-- Select Semester --</option>';

            if (semestersData.length === 0) {
                semesterSelect.innerHTML = '<option value="" disabled>No semesters registered yet</option>';
                return;
            }

            const now = new Date();

            semestersData.forEach(semester => {
                const option = document.createElement('option');
                option.value = semester.id;

                let isDeadlinePassed = false;
                if (semester.feedbackDeadline) {
                    const deadlineDate = new Date(semester.feedbackDeadline + 'T23:59:59');
                    if (deadlineDate < now) {
                        isDeadlinePassed = true;
                    }
                }

                let statusSuffix = '';
                let isDisabled = false;

                if (!semester.feedbackOpen) {
                    statusSuffix = ' (Closed)';
                    isDisabled = true;
                } else if (isDeadlinePassed) {
                    statusSuffix = ' (Deadline Passed)';
                    isDisabled = true;
                }

                option.textContent = `${semester.semesterName}${statusSuffix}`;
                if (isDisabled) {
                    option.disabled = true;
                }

                semesterSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error fetching semesters:', error);
            semesterSelect.innerHTML = '<option value="" disabled>Error loading semesters</option>';
            showError('Unable to load semesters from the backend.');
        });
}

/**
 * Load courses from /api/courses
 */
function loadCourses() {
    const courseSelect = document.getElementById('course-select');
    if (!courseSelect) return;

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
            courseSelect.innerHTML = '<option value="" disabled selected>-- Select Course --</option>';

            if (coursesData.length === 0) {
                courseSelect.innerHTML = '<option value="" disabled>No courses registered yet</option>';
                showError('No courses found. Please register courses before submitting feedback.');
                return;
            }

            coursesData.forEach(course => {
                const option = document.createElement('option');
                option.value = course.id;
                option.textContent = `${course.courseCode} - ${course.courseName}`;

                if (preselectedCourseId && String(course.id) === String(preselectedCourseId)) {
                    option.selected = true;
                }

                courseSelect.appendChild(option);
            });

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
 * Update course preview card when selected (if element exists)
 */
function onCourseSelected() {
    const courseSelect = document.getElementById('course-select');
    if (!courseSelect) return;
    const courseId = courseSelect.value;
    const card = document.getElementById('course-info-card');

    const course = coursesData.find(c => String(c.id) === String(courseId));
    if (course && card) {
        const codeEl = document.getElementById('info-course-code');
        const nameEl = document.getElementById('info-course-name');
        const deptEl = document.getElementById('info-course-dept');
        if (codeEl) codeEl.textContent = course.courseCode || '';
        if (nameEl) nameEl.textContent = course.courseName || '';
        if (deptEl) deptEl.textContent = course.department || '';
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
    if (!container) return;

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
 * Depends ONLY on answered feedback questions
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

    const studentSelect = document.getElementById('student-select');
    const studentId = studentSelect ? studentSelect.value : '';
    if (!studentId) {
        showError('Please select a student.');
        if (studentSelect) studentSelect.focus();
        return;
    }

    const semesterSelect = document.getElementById('semester-select');
    const semesterId = semesterSelect ? semesterSelect.value : '';
    if (!semesterId) {
        showError('Please select a semester.');
        if (semesterSelect) semesterSelect.focus();
        return;
    }

    const courseSelect = document.getElementById('course-select');
    const courseId = courseSelect ? courseSelect.value : '';
    if (!courseId) {
        showError('Please select a course.');
        if (courseSelect) courseSelect.focus();
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
        studentId: Number(studentId),
        courseId: Number(courseId),
        semesterId: Number(semesterId),
        ratings: ratings
    };

    const submitBtn = document.getElementById('btn-submit');
    if (submitBtn) submitBtn.disabled = true;

    fetch('/api/feedback', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
        .then(async response => {
            if (!response.ok) {
                let errorMsg = 'Failed to submit feedback.';
                try {
                    const errorData = await response.json();
                    if (errorData && errorData.message) {
                        errorMsg = errorData.message;
                    } else if (errorData && errorData.error) {
                        errorMsg = errorData.error;
                    }
                } catch (jsonErr) {
                    errorMsg = response.statusText || errorMsg;
                }
                throw new Error(errorMsg);
            }
            return response.json();
        })
        .then(savedFeedback => {
            showSuccess('Feedback submitted successfully.');
            resetForm();
        })
        .catch(error => {
            console.error('Submission error:', error);
            showError(error.message || 'Failed to submit feedback. Please check your connection and try again.');
        })
        .finally(() => {
            if (submitBtn) submitBtn.disabled = false;
        });
}

/**
 * Reset form fields and progress bar
 */
function resetForm() {
    const studentSelect = document.getElementById('student-select');
    const semesterSelect = document.getElementById('semester-select');
    const courseSelect = document.getElementById('course-select');

    if (studentSelect) studentSelect.value = '';
    if (semesterSelect) semesterSelect.value = '';
    if (courseSelect) courseSelect.value = '';

    const checkedInputs = document.querySelectorAll('input[type="radio"]:checked');
    checkedInputs.forEach(input => {
        input.checked = false;
    });

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
