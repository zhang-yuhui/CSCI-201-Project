package com.csci201.project.controller;

import com.csci201.project.model.Cafe;
import com.csci201.project.repository.CafeRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cafes")
@CrossOrigin(origins = "http://localhost:3000") // Allow frontend
public class CafeController {

    private final CafeRepository cafeRepository;

    public CafeController(CafeRepository cafeRepository) {
        this.cafeRepository = cafeRepository;
    }

    @GetMapping
    public List<Cafe> getAllCafes() {
        return cafeRepository.findAll();
    }
}
