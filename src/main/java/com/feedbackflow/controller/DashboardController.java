package com.feedbackflow.controller;

import com.feedbackflow.dto.DashboardSummaryResponse;
import com.feedbackflow.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Dashboard", description = "Dashboard summary APIs")
@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    // Constructor injection
    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    // Get dashboard summary statistics
    @Operation(summary = "Get dashboard summary statistics")
    @GetMapping("/summary")
    public DashboardSummaryResponse getDashboardSummary() {
        return dashboardService.getDashboardSummary();
    }
}
