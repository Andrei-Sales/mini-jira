package com.example.minijira.service;

import com.example.minijira.dto.AuthResponseDTO;
import com.example.minijira.dto.CreateUserDTO;
import com.example.minijira.dto.LoginDTO;

public interface AuthService {
    AuthResponseDTO register(CreateUserDTO request);
    AuthResponseDTO login(LoginDTO request);
}