package com.csci201.project.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class CafeRequest {

    @NotBlank
    private String name;

    @NotBlank
    private String address;

    @NotNull
    private Double latitude;

    @NotNull
    private Double longitude;

    private double price;

    private int userId;

    private double overallRating;

    private List<String> tags;

    private String aiSummary;

    public String getName() { return name; }
    public String getAddress() { return address; }
    public Double getLatitude() { return latitude; }
    public Double getLongitude() { return longitude; }
    public double getPrice() { return price; }
    public int getUserId() { return userId; }
    public double getOverallRating() { return overallRating; }
    public List<String> getTags() { return tags; }
    public String getAiSummary() { return aiSummary; }

    public void setName(String name) { this.name = name; }
    public void setAddress(String address) { this.address = address; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public void setPrice(double price) { this.price = price; }
    public void setUserId(int userId) { this.userId = userId; }
    public void setOverallRating(double overallRating) { this.overallRating = overallRating; }
    public void setTags(List<String> tags) { this.tags = tags; }
    public void setAiSummary(String aiSummary) { this.aiSummary = aiSummary; }
}
