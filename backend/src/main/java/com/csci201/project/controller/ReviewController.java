package com.csci201.project.controller;

import com.csci201.project.model.Cafe;
import com.csci201.project.model.Review;
import com.csci201.project.model.User;
import com.csci201.project.repository.CafeRepository;
import com.csci201.project.repository.ReviewRepository;
import com.csci201.project.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "http://localhost:3000")
public class ReviewController {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private CafeRepository cafeRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Get all reviews for a specific cafe
     */
    @GetMapping("/cafe/{cafeId}")
    public ResponseEntity<?> getReviewsForCafe(@PathVariable Integer cafeId) {
        try {
            Cafe cafe = cafeRepository.findById(cafeId)
                    .orElse(null);

            if (cafe == null) {
                return ResponseEntity.badRequest().body(createErrorResponse("Cafe not found"));
            }

            List<Review> reviews = reviewRepository.findByCafeCafeId(cafeId);

            // Calculate average rating
            Double avgRating = reviewRepository.getAverageRatingByCafeId(cafeId);
            Long reviewCount = reviewRepository.countReviewsByCafeId(cafeId);

            // Format reviews with user info
            List<Map<String, Object>> formattedReviews = reviews.stream()
                    .map(review -> {
                        Map<String, Object> reviewMap = new HashMap<>();
                        reviewMap.put("id", review.getId());
                        reviewMap.put("rating", review.getRating());
                        reviewMap.put("comment", review.getComment());
                        reviewMap.put("createdAt", review.getCreatedAt());
                        reviewMap.put("username", review.getUser().getUsername());
                        reviewMap.put("userId", review.getUser().getId());
                        return reviewMap;
                    })
                    .collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("reviews", formattedReviews);
            response.put("averageRating", avgRating != null ? avgRating : 0.0);
            response.put("reviewCount", reviewCount != null ? reviewCount : 0);
            response.put("cafe", Map.of(
                    "id", cafe.getCafeId(),
                    "name", cafe.getName(),
                    "address", cafe.getAddress(),
                    "price", cafe.getPrice(),
                    "tags", cafe.getTags(),
                    "aiSummary", cafe.getAiSummary()
            ));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(createErrorResponse("Failed to fetch reviews: " + e.getMessage()));
        }
    }

    /**
     * Create a new review for a cafe (requires authentication)
     */
    @PostMapping("/cafe/{cafeId}")
    public ResponseEntity<?> createReview(
            @PathVariable Integer cafeId,
            @RequestBody Map<String, Object> payload) {
        try {
            // Get current authenticated user
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Find the cafe
            Cafe cafe = cafeRepository.findById(cafeId)
                    .orElse(null);

            if (cafe == null) {
                return ResponseEntity.badRequest().body(createErrorResponse("Cafe not found"));
            }

            // Validate rating
            Double rating = null;
            try {
                Object ratingObj = payload.get("rating");
                if (ratingObj instanceof Number) {
                    rating = ((Number) ratingObj).doubleValue();
                } else if (ratingObj instanceof String) {
                    rating = Double.parseDouble((String) ratingObj);
                }
            } catch (Exception e) {
                return ResponseEntity.badRequest().body(createErrorResponse("Invalid rating format"));
            }

            if (rating == null || rating < 0 || rating > 5) {
                return ResponseEntity.badRequest().body(createErrorResponse("Rating must be between 0 and 5"));
            }

            String comment = (String) payload.get("comment");
            if (comment != null && comment.length() > 1000) {
                return ResponseEntity.badRequest().body(createErrorResponse("Comment is too long (max 1000 characters)"));
            }

            // Check if user already reviewed this cafe
            List<Review> existingReviews = reviewRepository.findByUserId(user.getId());
            boolean alreadyReviewed = existingReviews.stream()
                    .anyMatch(r -> r.getCafe().getCafeId().equals(cafeId));

            if (alreadyReviewed) {
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("You have already reviewed this cafe. You can only review once."));
            }

            // Create new review
            Review review = new Review(user, cafe, rating, comment);
            reviewRepository.save(review);

            // Return the created review with user info
            Map<String, Object> reviewResponse = new HashMap<>();
            reviewResponse.put("id", review.getId());
            reviewResponse.put("rating", review.getRating());
            reviewResponse.put("comment", review.getComment());
            reviewResponse.put("createdAt", review.getCreatedAt());
            reviewResponse.put("username", user.getUsername());
            reviewResponse.put("userId", user.getId());

            // Calculate new average rating
            Double newAvgRating = reviewRepository.getAverageRatingByCafeId(cafeId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Review submitted successfully!");
            response.put("review", reviewResponse);
            response.put("newAverageRating", newAvgRating);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(createErrorResponse("Failed to create review: " + e.getMessage()));
        }
    }

    /**
     * Delete a review (only the user who created it can delete)
     */
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<?> deleteReview(@PathVariable Long reviewId) {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Review review = reviewRepository.findById(reviewId)
                    .orElse(null);

            if (review == null) {
                return ResponseEntity.badRequest().body(createErrorResponse("Review not found"));
            }

            // Check if the user owns this review
            if (!review.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(403)
                        .body(createErrorResponse("You can only delete your own reviews"));
            }

            Integer cafeId = review.getCafe().getCafeId();
            reviewRepository.delete(review);

            // Calculate new average rating
            Double newAvgRating = reviewRepository.getAverageRatingByCafeId(cafeId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Review deleted successfully");
            response.put("newAverageRating", newAvgRating);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(createErrorResponse("Failed to delete review: " + e.getMessage()));
        }
    }

    /**
     * Get all reviews by the current user
     */
    @GetMapping("/my-reviews")
    public ResponseEntity<?> getMyReviews() {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<Review> reviews = reviewRepository.findByUserId(user.getId());

            List<Map<String, Object>> formattedReviews = reviews.stream()
                    .map(review -> {
                        Map<String, Object> reviewMap = new HashMap<>();
                        reviewMap.put("id", review.getId());
                        reviewMap.put("rating", review.getRating());
                        reviewMap.put("comment", review.getComment());
                        reviewMap.put("createdAt", review.getCreatedAt());
                        reviewMap.put("cafeName", review.getCafe().getName());
                        reviewMap.put("cafeAddress", review.getCafe().getAddress());
                        reviewMap.put("cafeId", review.getCafe().getCafeId());
                        return reviewMap;
                    })
                    .toList();

            return ResponseEntity.ok(Map.of("reviews", formattedReviews));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(createErrorResponse("Failed to fetch your reviews: " + e.getMessage()));
        }
    }

    // Helper method
    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("error", message);
        return response;
    }
}