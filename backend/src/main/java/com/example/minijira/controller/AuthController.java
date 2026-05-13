package com.example.minijira.controller;

import com.example.minijira.dto.AuthResponseDTO;
import com.example.minijira.dto.CreateUserDTO;
import com.example.minijira.dto.LoginDTO;
import com.example.minijira.dto.common.ApiMessageResponse;
import com.example.minijira.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public AuthResponseDTO register(@Valid @RequestBody CreateUserDTO request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponseDTO login(@Valid @RequestBody LoginDTO request) {
        return authService.login(request);
    }

    @PostMapping("/logout")
    public ApiMessageResponse logout() {
        return ApiMessageResponse.builder().message("Logged out successfully").build();
    }
}