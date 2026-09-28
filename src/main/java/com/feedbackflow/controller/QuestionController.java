package com.feedbackflow.controller;

import com.feedbackflow.model.Question;
import com.feedbackflow.service.QuestionService;
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

@Tag(name = "Questions", description = "Feedback question APIs")
@RestController
@RequestMapping("/api/questions")
public class QuestionController {

    private final QuestionService questionService;

    // Constructor injection
    public QuestionController(QuestionService questionService) {
        this.questionService = questionService;
    }

    // Get all questions
    @Operation(summary = "Get all questions")
    @GetMapping
    public List<Question> getAllQuestions() {
        return questionService.getAllQuestions();
    }

    // Get question by id
    @Operation(summary = "Get question by ID")
    @GetMapping("/{id}")
    public Question getQuestionById(@PathVariable Long id) {
        return questionService.getQuestionById(id);
    }

    // Create a new question
    @Operation(summary = "Create a new question")
    @PostMapping
    public Question createQuestion(@RequestBody Question question) {
        return questionService.createQuestion(question);
    }

    // Update a question by id
    @Operation(summary = "Update question by ID")
    @PutMapping("/{id}")
    public Question updateQuestion(@PathVariable Long id, @RequestBody Question question) {
        return questionService.updateQuestion(id, question);
    }

    // Delete a question by id
    @Operation(summary = "Delete question by ID")
    @DeleteMapping("/{id}")
    public String deleteQuestion(@PathVariable Long id) {
        questionService.deleteQuestion(id);
        return "Question deleted successfully";
    }
}
