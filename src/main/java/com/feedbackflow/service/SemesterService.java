package com.feedbackflow.service;

import com.feedbackflow.dto.SemesterStatusResponse;
import com.feedbackflow.model.Semester;
import com.feedbackflow.repository.SemesterRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class SemesterService {

    private final SemesterRepository semesterRepository;

    // Constructor injection
    public SemesterService(SemesterRepository semesterRepository) {
        this.semesterRepository = semesterRepository;
    }

    // Get all semesters
    public List<Semester> getAllSemesters() {
        return semesterRepository.findAll();
    }

    // Get semester by ID
    public Semester getSemesterById(Long id) {
        return semesterRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Semester not found"));
    }

    // Create a new semester
    public Semester createSemester(Semester semester) {
        if (semester == null) {
            throw new RuntimeException("Semester details are required");
        }

        if (semester.getSemesterName() == null || semester.getSemesterName().trim().isEmpty()) {
            throw new RuntimeException("Semester name is required");
        }

        semester.setSemesterName(semester.getSemesterName().trim());
        return semesterRepository.save(semester);
    }

    // Update an existing semester
    public Semester updateSemester(Long id, Semester semester) {
        Semester existing = getSemesterById(id);

        if (semester == null) {
            throw new RuntimeException("Semester details are required");
        }

        if (semester.getSemesterName() == null || semester.getSemesterName().trim().isEmpty()) {
            throw new RuntimeException("Semester name is required");
        }

        existing.setSemesterName(semester.getSemesterName().trim());
        existing.setFeedbackDeadline(semester.getFeedbackDeadline());
        existing.setFeedbackOpen(semester.isFeedbackOpen());

        return semesterRepository.save(existing);
    }

    // Delete a semester by ID
    public void deleteSemester(Long id) {
        if (!semesterRepository.existsById(id)) {
            throw new RuntimeException("Semester not found");
        }
        semesterRepository.deleteById(id);
    }

    // Open feedback for a semester
    public Semester openFeedback(Long semesterId) {
        Semester semester = getSemesterById(semesterId);
        semester.setFeedbackOpen(true);
        return semesterRepository.save(semester);
    }

    // Close feedback for a semester
    public Semester closeFeedback(Long semesterId) {
        Semester semester = getSemesterById(semesterId);
        semester.setFeedbackOpen(false);
        return semesterRepository.save(semester);
    }

    // Check if feedback submission is allowed
    public boolean isFeedbackSubmissionAllowed(Long semesterId) {
        if (semesterId == null) {
            return false;
        }
        Optional<Semester> optional = semesterRepository.findById(semesterId);
        if (optional.isEmpty()) {
            return false;
        }
        Semester semester = optional.get();
        if (!semester.isFeedbackOpen()) {
            return false;
        }
        if (semester.getFeedbackDeadline() != null && LocalDate.now().isAfter(semester.getFeedbackDeadline())) {
            return false;
        }
        return true;
    }

    // Get semester feedback status
    public SemesterStatusResponse getSemesterStatus(Long semesterId) {
        Semester semester = getSemesterById(semesterId);
        boolean allowed = isFeedbackSubmissionAllowed(semesterId);
        return new SemesterStatusResponse(
                semester.getId(),
                semester.getSemesterName(),
                semester.isFeedbackOpen(),
                semester.getFeedbackDeadline(),
                allowed
        );
    }
}
