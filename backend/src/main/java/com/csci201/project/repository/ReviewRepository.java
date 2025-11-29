package com.csci201.project.repository;

import com.csci201.project.model.Review;
import com.csci201.project.model.User;
import com.csci201.project.model.Cafe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByUser(User user);
    List<Review> findByCafe(Cafe cafe);
    List<Review> findByUserId(Long userId);
    List<Review> findByCafeCafeId(Integer cafeId);
}
