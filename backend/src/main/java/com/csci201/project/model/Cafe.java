package com.csci201.project.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "cafes")
public class Cafe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cafe_id")
    private Integer cafeId;

    private String name;
    private String address;
    private double latitude;
    private double longitude;
    private double price;

    @Column(name = "user_id")
    private int userId;

    @Column(name = "overall_rating")
    private double overallRating;

    private String tags;

    @Column(name = "ai_summary")
    private String aiSummary;

    // getters only
    public Integer getCafeId() { return cafeId; }
    public String getName() { return name; }
    public String getAddress() { return address; }
    public double getLatitude() { return latitude; }
    public double getLongitude() { return longitude; }
    public double getPrice() { return price; }
    public int getUserId() { return userId; }
    public double getOverallRating() { return overallRating; }
    public String getTags() { return tags; }
    public String getAiSummary() { return aiSummary; }
}
