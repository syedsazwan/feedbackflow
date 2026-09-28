package com.feedbackflow.repository;

import com.feedbackflow.model.FeedbackResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackResponseRepository extends JpaRepository<FeedbackResponse, Long> {

    @Query("SELECT fr FROM FeedbackResponse fr WHERE fr.feedback.course.id = :courseId")
    List<FeedbackResponse> findByCourseId(@Param("courseId") Long courseId);

    @Query("SELECT AVG(fr.rating) FROM FeedbackResponse fr")
    Double getOverallAverageRating();
}
