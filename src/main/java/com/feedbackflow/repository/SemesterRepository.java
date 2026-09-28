package com.feedbackflow.repository;

import com.feedbackflow.model.Semester;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SemesterRepository extends JpaRepository<Semester, Long> {
    long countByFeedbackOpenTrue();
}
