package com.csci201.project.controller;

import com.csci201.project.model.Cafe;
import com.csci201.project.repository.CafeRepository;
import com.csci201.project.repository.ReviewRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/cafes")
@CrossOrigin(origins = "http://localhost:3000") // Allow frontend
public class CafeController {

    private final CafeRepository cafeRepository;
    private final ReviewRepository reviewRepository;

    public CafeController(CafeRepository cafeRepository, ReviewRepository reviewRepository) {
        this.cafeRepository = cafeRepository;
        this.reviewRepository = reviewRepository;
    }

    @GetMapping
    public List<Cafe> getAllCafes() {
        return cafeRepository.findAll();
    }

    /**
     * Get trending cafes with average rating calculated from reviews.
     * Only returns cafes with rating >= 4.0, sorted by rating descending.
     * The overallRating is dynamically calculated from the average of all user reviews.
     */
    @GetMapping("/trending")
    public List<Cafe> getTrendingCafes() {
        List<Cafe> allCafes = cafeRepository.findAll();
        
        // Calculate average rating from reviews for each cafe
        for (Cafe cafe : allCafes) {
            Double avgRating = reviewRepository.getAverageRatingByCafeId(cafe.getCafeId());
            if (avgRating != null) {
                // Update the overallRating with the calculated average from reviews
                cafe.setOverallRating(avgRating);
            }
            // If no reviews, keep the existing overallRating from the database
        }
        
        // Filter cafes with rating >= 4.0 and sort by rating descending
        return allCafes.stream()
                .filter(cafe -> cafe.getOverallRating() >= 4.0)
                .sorted((a, b) -> Double.compare(b.getOverallRating(), a.getOverallRating()))
                .limit(10)
                .collect(Collectors.toList());
    }
}
