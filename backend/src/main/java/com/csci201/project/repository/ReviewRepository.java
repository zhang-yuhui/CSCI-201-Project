package com.csci201.project.repository;

import com.csci201.project.model.Review;
import com.csci201.project.model.User;
import com.csci201.project.model.Cafe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByUser(User user);
    List<Review> findByCafe(Cafe cafe);
    List<Review> findByUserId(Long userId);
    List<Review> findByCafeCafeId(Integer cafeId);

    long countByUserId(Long userId);

    /**
     * Calculate the average rating for a specific cafe from all reviews
     */
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.cafe.cafeId = :cafeId")
    Double getAverageRatingByCafeId(@Param("cafeId") Integer cafeId);

    /**
     * Count the number of reviews for a specific cafe
     */
    @Query("SELECT COUNT(r) FROM Review r WHERE r.cafe.cafeId = :cafeId")
    Long countReviewsByCafeId(@Param("cafeId") Integer cafeId);
}
