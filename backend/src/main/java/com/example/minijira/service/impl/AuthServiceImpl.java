package com.example.minijira.service.impl;

import com.example.minijira.dto.AuthResponseDTO;
import com.example.minijira.dto.CreateUserDTO;
import com.example.minijira.dto.LoginDTO;
import com.example.minijira.entity.User;
import com.example.minijira.enums.UserRole;
import com.example.minijira.exception.BadRequestException;
import com.example.minijira.repository.UserRepository;
import com.example.minijira.security.CustomUserDetails;
import com.example.minijira.security.JwtTokenProvider;
import com.example.minijira.service.ActivityLogService;
import com.example.minijira.service.AuthService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final ActivityLogService activityLogService;

    public AuthServiceImpl(UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           AuthenticationManager authenticationManager,
                           JwtTokenProvider jwtTokenProvider,
                           ActivityLogService activityLogService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
        this.activityLogService = activityLogService;
    }

    @Override
    @Transactional
    public AuthResponseDTO register(CreateUserDTO request) {
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new BadRequestException("Email already exists");
        }

        User user = User.builder()
                .email(email)
                .fullName(request.getFullName().trim())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(UserRole.DEVELOPER)
                .active(true)
                .build();

        user = userRepository.save(user);

        CustomUserDetails principal = new CustomUserDetails(user);
        String token = jwtTokenProvider.generateToken(principal);

        activityLogService.log(user.getId(), "REGISTER", "USER", user.getId(), "User registered: " + user.getEmail());

        return AuthResponseDTO.builder()
                .token(token)
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .build();
    }

    @Override
    public AuthResponseDTO login(LoginDTO request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail().trim().toLowerCase(), request.getPassword())
        );

        CustomUserDetails principal = (CustomUserDetails) authentication.getPrincipal();
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new BadRequestException("User not found"));

        String token = jwtTokenProvider.generateToken(principal);
        activityLogService.log(user.getId(), "LOGIN", "USER", user.getId(), "User logged in");

        return AuthResponseDTO.builder()
                .token(token)
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .build();
    }
}