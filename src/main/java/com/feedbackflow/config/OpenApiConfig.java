package com.feedbackflow.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI feedbackFlowOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("FeedbackFlow API")
                        .description("Course Feedback Collection System REST API")
                        .version("1.0"));
    }
}
