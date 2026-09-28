package com.feedbackflow.controller;

import com.feedbackflow.model.Course;
import com.feedbackflow.service.CourseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "Courses", description = "Course management APIs")
@RestController
@RequestMapping("/api/courses")
public class CourseController {

    private final CourseService courseService;

    // Constructor injection
    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    // Get all courses
    @Operation(summary = "Get all courses")
    @GetMapping
    public List<Course> getAllCourses() {
        return courseService.getAllCourses();
    }

    // Get course by id
    @Operation(summary = "Get course by ID")
    @GetMapping("/{id}")
    public Course getCourseById(@PathVariable Long id) {
        return courseService.getCourseById(id);
    }

    // Create a new course
    @Operation(summary = "Create a new course")
    @PostMapping
    public Course createCourse(@RequestBody Course course) {
        return courseService.createCourse(course);
    }

    // Update a course by id
    @Operation(summary = "Update course by ID")
    @PutMapping("/{id}")
    public Course updateCourse(@PathVariable Long id, @RequestBody Course course) {
        return courseService.updateCourse(id, course);
    }

    // Delete a course by id
    @Operation(summary = "Delete course by ID")
    @DeleteMapping("/{id}")
    public String deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
        return "Course deleted successfully";
    }
}
