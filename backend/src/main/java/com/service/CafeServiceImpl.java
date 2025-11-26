package com.csci201.project.service;

import com.csci201.project.model.Cafe;
import com.csci201.project.repository.CafeRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CafeServiceImpl implements CafeService {

    private final CafeRepository cafeRepository;

    public CafeServiceImpl(CafeRepository cafeRepository) {
        this.cafeRepository = cafeRepository;
    }

    @Override
    public List<Cafe> getAllCafes() {
        return cafeRepository.findAll();
    }
}
