package com.csci201.project.controller;

import com.csci201.project.dto.JwtResponse;
import com.csci201.project.dto.LoginRequest;
import com.csci201.project.dto.RegisterRequest;
import com.csci201.project.model.User;
import com.csci201.project.repository.UserRepository;
import com.csci201.project.util.JwtUtils;
import com.csci201.project.util.UserTrie;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UserTrie userTrie;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        Map<String, String> errors = new HashMap<>();

        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            errors.put("username", "Username is already taken!");
        }

        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            errors.put("email", "Email is already in use!");
        }

        String password = registerRequest.getPassword();
        if (!isStrongPassword(password)) {
            errors.put(
                    "password",
                    "Password must be at least 6 characters and include at least one uppercase letter, one lowercase letter, one number, and one special character."
            );
        }

        if (!errors.isEmpty()) {
            return ResponseEntity.badRequest().body(errors);
        }

        User user = new User(
                registerRequest.getUsername(),
                registerRequest.getEmail(),
                passwordEncoder.encode(registerRequest.getPassword())
        );

        userRepository.save(user);
        userTrie.insert(user.getId(), user.getUsername(), user.getEmail());

        Map<String, String> response = new HashMap<>();
        response.put("message", "User registered successfully!");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()
                    )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateToken(loginRequest.getUsername());

            return ResponseEntity.ok(new JwtResponse(jwt, loginRequest.getUsername()));
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Invalid username or password!");
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Authentication endpoint is working!");
    }

    private boolean isStrongPassword(String password) {
        if (password == null) {
            return false;
        }
        // At least 6 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special character
        String pattern = "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[^a-zA-Z0-9]).{6,}$";
        return password.matches(pattern);
    }
}
