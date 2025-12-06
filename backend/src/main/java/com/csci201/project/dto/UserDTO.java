package com.csci201.project.dto;

/**
 * Data Transfer Object for User - excludes sensitive fields like password
 */
public class UserDTO {
    private Long id;
    private String username;
    private String email;
    private Long reviewCount;

    public UserDTO() {}

    public UserDTO(Long id, String username, String email) {
        this.id = id;
        this.username = username;
        this.email = email;
    }

    public UserDTO(Long id, String username, String email, Long reviewCount) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.reviewCount = reviewCount;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Long getReviewCount() {
        return reviewCount;
    }

    public void setReviewCount(Long reviewCount) {
        this.reviewCount = reviewCount;
    }
}
