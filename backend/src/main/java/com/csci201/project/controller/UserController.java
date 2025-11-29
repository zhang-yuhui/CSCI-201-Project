package com.csci201.project.controller;

import com.csci201.project.dto.UserDTO;
import com.csci201.project.model.User;
import com.csci201.project.repository.UserRepository;
import com.csci201.project.util.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtils jwtUtils;

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
        
        List<UserDTO> results = userRepository.findAll().stream()
                .filter(u -> u.getUsername().toLowerCase().contains(query.toLowerCase()))
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
            String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
            User currentUser = userRepository.findByUsername(currentUsername)
                    .orElseThrow(() -> new RuntimeException("Current user not found"));

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
            String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
            User currentUser = userRepository.findByUsername(currentUsername)
                    .orElseThrow(() -> new RuntimeException("Current user not found"));

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
            String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
            User currentUser = userRepository.findByUsername(currentUsername)
                    .orElseThrow(() -> new RuntimeException("Current user not found"));

            List<UserDTO> friends = currentUser.getFriends().stream()
                    .map(f -> new UserDTO(f.getId(), f.getUsername(), f.getEmail()))
                    .collect(Collectors.toList());

            return ResponseEntity.ok(Map.of(
                "friends", friends,
                "count", friends.size()
            ));
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

            currentUser.setUsername(newUsername);
            userRepository.save(currentUser);

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
