package com.feedbackflow.config;

import com.feedbackflow.model.Question;
import com.feedbackflow.repository.QuestionRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initQuestions(QuestionRepository questionRepository) {
        return args -> {
            if (questionRepository.count() == 0) {
                List<Question> defaultQuestions = List.of(
                        new Question("How clearly was the subject explained?"),
                        new Question("Was the course content useful?"),
                        new Question("Was the teaching effective?"),
                        new Question("Were doubts clarified properly?"),
                        new Question("Overall satisfaction with the course?")
                );
                questionRepository.saveAll(defaultQuestions);
            }
        };
    }
}
