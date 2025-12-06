package com.csci201.project.controller;

import com.csci201.project.dto.UserDTO;
import com.csci201.project.model.Review;
import com.csci201.project.model.User;
import com.csci201.project.repository.ReviewRepository;
import com.csci201.project.repository.UserRepository;
import com.csci201.project.util.JwtUtils;
import com.csci201.project.util.UserTrie;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private UserTrie userTrie;

    @PostConstruct
    public void preloadTrie() {
        userRepository.findAll().forEach(u -> userTrie.insert(u.getId(), u.getUsername(), u.getEmail()));
    }

    /**
     * Search for users by username (case-insensitive, partial match)
     * Returns UserDTO to avoid exposing passwords
     */
    @GetMapping("/search")
    public ResponseEntity<?> searchUsers(@RequestParam String query) {
        if (query == null || query.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(createErrorResponse("Search query cannot be empty"));
        }

        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();

        List<UserDTO> results = userTrie.searchByPrefix(query.trim()).stream()
                .filter(u -> !u.getUsername().equals(currentUsername)) // Exclude current user
                .map(u -> new UserDTO(u.getId(), u.getUsername(), u.getEmail()))
                .collect(Collectors.toList());

        if (results.isEmpty()) {
            return ResponseEntity.ok(Map.of(
                "users", results,
                "message", "No users found matching '" + query + "'"
            ));
        }

        return ResponseEntity.ok(Map.of("users", results));
    }

    /**
     * Add a friend to the current user's friends list
     */
    @PostMapping("/add-friend/{friendId}")
    public ResponseEntity<?> addFriend(@PathVariable Long friendId) {
        try {
            // Ensure request is authenticated
            var auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
                return ResponseEntity.status(401).body(createErrorResponse("Not authenticated"));
            }

            String currentUsername = auth.getName();
            User currentUser = userRepository.findByUsername(currentUsername)
                    .orElse(null);

            if (currentUser == null) {
                return ResponseEntity.status(401).body(createErrorResponse("Current user not found. Please log in again."));
            }

            // Check if trying to add self
            if (currentUser.getId().equals(friendId)) {
                return ResponseEntity.badRequest().body(createErrorResponse("You cannot add yourself as a friend"));
            }

            User friend = userRepository.findById(friendId)
                    .orElse(null);

            if (friend == null) {
                return ResponseEntity.badRequest().body(createErrorResponse("User not found with ID: " + friendId));
            }

            // Check if already friends
            if (currentUser.getFriends().contains(friend)) {
                return ResponseEntity.badRequest().body(createErrorResponse("You are already friends with " + friend.getUsername()));
            }

            currentUser.addFriend(friend);
            userRepository.save(currentUser);

            return ResponseEntity.ok(createSuccessResponse("Successfully added " + friend.getUsername() + " as a friend!"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(createErrorResponse("Failed to add friend: " + e.getMessage()));
        }
    }

    /**
     * Remove a friend from the current user's friends list
     */
    @DeleteMapping("/remove-friend/{friendId}")
    public ResponseEntity<?> removeFriend(@PathVariable Long friendId) {
        try {
            var auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
                return ResponseEntity.status(401).body(createErrorResponse("Not authenticated"));
            }

            String currentUsername = auth.getName();
            User currentUser = userRepository.findByUsername(currentUsername)
                    .orElse(null);

            if (currentUser == null) {
                return ResponseEntity.status(401).body(createErrorResponse("Current user not found. Please log in again."));
            }

            User friend = userRepository.findById(friendId)
                    .orElse(null);

            if (friend == null) {
                return ResponseEntity.badRequest().body(createErrorResponse("User not found"));
            }

            if (!currentUser.getFriends().contains(friend)) {
                return ResponseEntity.badRequest().body(createErrorResponse("This user is not in your friends list"));
            }

            currentUser.removeFriend(friend);
            userRepository.save(currentUser);

            return ResponseEntity.ok(createSuccessResponse("Successfully removed " + friend.getUsername() + " from friends"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(createErrorResponse("Failed to remove friend: " + e.getMessage()));
        }
    }

    /**
     * Get all friends of the current user
     */
    @GetMapping("/friends")
    public ResponseEntity<?> getFriends() {
        try {
            var auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
                return ResponseEntity.status(401).body(createErrorResponse("Not authenticated"));
            }

            String currentUsername = auth.getName();
            User currentUser = userRepository.findByUsername(currentUsername)
                    .orElse(null);

            if (currentUser == null) {
                return ResponseEntity.status(401).body(createErrorResponse("Current user not found. Please log in again."));
            }

            // Fetch per-friend review counts in parallel to reduce latency
            ExecutorService executor = Executors.newFixedThreadPool(10);
            try {
                List<CompletableFuture<UserDTO>> futures = currentUser.getFriends().stream()
                        .map(friend -> CompletableFuture.supplyAsync(() -> {
                            long reviewCount = reviewRepository.countByUserId(friend.getId());
                            return new UserDTO(friend.getId(), friend.getUsername(), friend.getEmail(), reviewCount);
                        }, executor))
                        .collect(Collectors.toList());

                List<UserDTO> friends = futures.stream()
                        .map(CompletableFuture::join)
                        .collect(Collectors.toList());

                return ResponseEntity.ok(Map.of(
                    "friends", friends,
                    "count", friends.size()
                ));
            } finally {
                executor.shutdown();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(createErrorResponse("Failed to get friends: " + e.getMessage()));
        }
    }

    /**
     * Update current user's profile (username)
     */
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> payload) {
        try {
            String newUsername = payload.get("username");
            
            if (newUsername == null || newUsername.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(createErrorResponse("Username cannot be empty"));
            }

            if (newUsername.length() < 3 || newUsername.length() > 50) {
                return ResponseEntity.badRequest().body(createErrorResponse("Username must be between 3 and 50 characters"));
            }

            String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
            User currentUser = userRepository.findByUsername(currentUsername)
                    .orElseThrow(() -> new RuntimeException("Current user not found"));

            // Check if username is the same
            if (currentUser.getUsername().equals(newUsername)) {
                return ResponseEntity.ok(createSuccessResponse("No changes made"));
            }

            // Check if username is already taken
            if (userRepository.existsByUsername(newUsername)) {
                return ResponseEntity.badRequest().body(createErrorResponse("Username '" + newUsername + "' is already taken"));
            }

            String oldUsername = currentUser.getUsername();

            currentUser.setUsername(newUsername);
            userRepository.save(currentUser);

            userTrie.remove(oldUsername);
            userTrie.insert(currentUser.getId(), newUsername, currentUser.getEmail());

            // Generate a new JWT token with the new username
            String newToken = jwtUtils.generateToken(newUsername);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Username successfully updated to '" + newUsername + "'",
                "newUsername", newUsername,
                "token", newToken
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(createErrorResponse("Failed to update profile: " + e.getMessage()));
        }
    }

    /**
     * Get current user's profile info
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUserProfile() {
        try {
            String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
            User currentUser = userRepository.findByUsername(currentUsername)
                    .orElseThrow(() -> new RuntimeException("Current user not found"));

            return ResponseEntity.ok(new UserDTO(currentUser.getId(), currentUser.getUsername(), currentUser.getEmail()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(createErrorResponse("Failed to get profile: " + e.getMessage()));
        }
    }

    /**
     * Get a specific user's profile with their cafe reviews
     * Used for viewing friend profiles
     */
    @GetMapping("/{userId}/profile")
    public ResponseEntity<?> getUserProfile(@PathVariable Long userId) {
        try {
            User user = userRepository.findById(userId)
                    .orElse(null);

            if (user == null) {
                return ResponseEntity.badRequest().body(createErrorResponse("User not found"));
            }

            // Get user's reviews with cafe info
            List<Review> userReviews = reviewRepository.findByUserId(userId);
            
            List<Map<String, Object>> reviewsWithCafeInfo = userReviews.stream()
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
                    .collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("user", new UserDTO(user.getId(), user.getUsername(), user.getEmail()));
            response.put("reviews", reviewsWithCafeInfo);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(createErrorResponse("Failed to get user profile: " + e.getMessage()));
        }
    }

    // Helper methods for consistent response format
    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("error", message);
        return response;
    }

    private Map<String, Object> createSuccessResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", message);
        return response;
    }
}
