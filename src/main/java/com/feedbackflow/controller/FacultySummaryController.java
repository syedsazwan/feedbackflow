package com.feedbackflow.controller;

import com.feedbackflow.dto.CourseFeedbackSummaryResponse;
import com.feedbackflow.service.FacultySummaryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "Faculty Summary", description = "Faculty and course feedback summary APIs")
@RestController
@RequestMapping("/api/faculty")
public class FacultySummaryController {

    private final FacultySummaryService facultySummaryService;

    // Constructor injection
    public FacultySummaryController(FacultySummaryService facultySummaryService) {
        this.facultySummaryService = facultySummaryService;
    }

    // Get feedback summary for all courses
    @Operation(summary = "Get feedback summary for all courses")
    @GetMapping("/summary")
    public List<CourseFeedbackSummaryResponse> getCourseFeedbackSummary() {
        return facultySummaryService.getCourseFeedbackSummary();
    }

    // Get feedback summary for a single course
    @Operation(summary = "Get feedback summary for a single course")
    @GetMapping("/summary/{courseId}")
    public CourseFeedbackSummaryResponse getCourseFeedbackSummaryById(@PathVariable Long courseId) {
        return facultySummaryService.getCourseFeedbackSummaryById(courseId);
    }
}
