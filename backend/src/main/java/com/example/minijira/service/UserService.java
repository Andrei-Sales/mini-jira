package com.example.minijira.service;

import com.example.minijira.dto.CreateUserDTO;
import com.example.minijira.dto.UpdateUserDTO;
import com.example.minijira.dto.UserDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserService {
    Page<UserDTO> getUsers(Boolean active, String search, Pageable pageable);
    UserDTO getUserById(Long id);
    UserDTO getCurrentUser(String email);
    UserDTO createUser(CreateUserDTO request);
    UserDTO updateUser(Long id, UpdateUserDTO request);
    UserDTO updateUserRole(Long id, UpdateUserDTO request);
    void deactivateUser(Long id);
    UserDTO updateProfile(String email, String fullName);
}