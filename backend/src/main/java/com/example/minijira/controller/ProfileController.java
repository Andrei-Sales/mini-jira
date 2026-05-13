package com.example.minijira.controller;

import com.example.minijira.dto.UserDTO;
import com.example.minijira.dto.request.UpdateProfileRequest;
import com.example.minijira.service.UserService;
import com.example.minijira.util.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/profile")
@PreAuthorize("isAuthenticated()")
public class ProfileController {

    private final UserService userService;

    public ProfileController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public UserDTO getProfile() {
        return userService.getCurrentUser(SecurityUtils.getCurrentUserEmail());
    }

    @PutMapping
    public UserDTO updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        return userService.updateProfile(SecurityUtils.getCurrentUserEmail(), request.getFullName());
    }
}