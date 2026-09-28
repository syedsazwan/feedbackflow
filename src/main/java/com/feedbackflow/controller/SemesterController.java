package com.feedbackflow.controller;

import com.feedbackflow.model.Semester;
import com.feedbackflow.service.SemesterService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@Tag(name = "Semesters", description = "Semester management APIs")
@RestController
@RequestMapping("/api/semesters")
public class SemesterController {

    private final SemesterService semesterService;

    // Constructor injection
    public SemesterController(SemesterService semesterService) {
        this.semesterService = semesterService;
    }

    // Get all semesters
    @Operation(summary = "Get all semesters")
    @GetMapping
    public List<Semester> getAllSemesters() {
        return semesterService.getAllSemesters();
    }

    // Get semester by ID
    @Operation(summary = "Get semester by ID")
    @GetMapping("/{id}")
    public Semester getSemesterById(@PathVariable Long id) {
        return semesterService.getSemesterById(id);
    }

    // Create a new semester (returns 201 CREATED)
    @Operation(summary = "Create a new semester")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Semester createSemester(@Valid @RequestBody Semester semester) {
        return semesterService.createSemester(semester);
    }

    // Update semester by ID
    @Operation(summary = "Update semester by ID")
    @PutMapping("/{id}")
    public Semester updateSemester(@PathVariable Long id, @Valid @RequestBody Semester semester) {
        return semesterService.updateSemester(id, semester);
    }

    // Delete semester by ID
    @Operation(summary = "Delete semester by ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteSemester(@PathVariable Long id) {
        semesterService.deleteSemester(id);
        return ResponseEntity.ok(Collections.singletonMap("message", "Semester deleted successfully"));
    }

    // Open feedback for a semester
    @Operation(summary = "Open feedback collection for a semester")
    @PutMapping("/{id}/open")
    public Semester openFeedback(@PathVariable Long id) {
        return semesterService.openFeedback(id);
    }

    // Close feedback for a semester
    @Operation(summary = "Close feedback collection for a semester")
    @PutMapping("/{id}/close")
    public Semester closeFeedback(@PathVariable Long id) {
        return semesterService.closeFeedback(id);
    }

    // Get feedback status for a semester
    @Operation(summary = "Get feedback status for a semester")
    @GetMapping("/{id}/status")
    public com.feedbackflow.dto.SemesterStatusResponse getSemesterStatus(@PathVariable Long id) {
        return semesterService.getSemesterStatus(id);
    }
}
