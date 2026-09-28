package com.feedbackflow.service;

import com.feedbackflow.model.Question;
import com.feedbackflow.repository.QuestionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class QuestionService {

    private final QuestionRepository questionRepository;

    // Constructor injection
    public QuestionService(QuestionRepository questionRepository) {
        this.questionRepository = questionRepository;
    }

    // Get all questions
    public List<Question> getAllQuestions() {
        return questionRepository.findAll();
    }

    // Get question by id
    public Question getQuestionById(Long id) {
        return questionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found"));
    }

    // Create a new question
    public Question createQuestion(Question question) {
        return questionRepository.save(question);
    }

    // Update an existing question
    public Question updateQuestion(Long id, Question questionDetails) {
        Question existingQuestion = getQuestionById(id);
        existingQuestion.setQuestionText(questionDetails.getQuestionText());
        return questionRepository.save(existingQuestion);
    }

    // Delete a question by id
    public void deleteQuestion(Long id) {
        Question existingQuestion = getQuestionById(id);
        questionRepository.delete(existingQuestion);
    }
}
