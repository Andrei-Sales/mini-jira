package com.example.minijira.service.impl;

import com.example.minijira.dto.CreateUserDTO;
import com.example.minijira.dto.UpdateUserDTO;
import com.example.minijira.dto.UserDTO;
import com.example.minijira.entity.User;
import com.example.minijira.enums.UserRole;
import com.example.minijira.exception.BadRequestException;
import com.example.minijira.exception.ResourceNotFoundException;
import com.example.minijira.mapper.UserMapper;
import com.example.minijira.repository.UserRepository;
import com.example.minijira.service.ActivityLogService;
import com.example.minijira.service.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final ActivityLogService activityLogService;

    public UserServiceImpl(UserRepository userRepository,
                           UserMapper userMapper,
                           PasswordEncoder passwordEncoder,
                           ActivityLogService activityLogService) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
        this.activityLogService = activityLogService;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserDTO> getUsers(Boolean active, String search, Pageable pageable) {
        Page<User> page;
        if (search != null && !search.isBlank()) {
            page = userRepository.findByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCase(search.trim(), search.trim(), pageable);
        } else if (active != null) {
            page = userRepository.findByActive(active, pageable);
        } else {
            page = userRepository.findAll(pageable);
        }
        return page.map(userMapper::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public UserDTO getUserById(Long id) {
        return userMapper.toDTO(getUserEntity(id));
    }

    @Override
    @Transactional(readOnly = true)
    public UserDTO getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return userMapper.toDTO(user);
    }

    @Override
    @Transactional
    public UserDTO createUser(CreateUserDTO request) {
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new BadRequestException("Email already exists");
        }

        UserRole role = request.getRole() != null ? request.getRole() : UserRole.DEVELOPER;
        User user = User.builder()
                .email(email)
                .fullName(request.getFullName().trim())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .active(true)
                .build();

        User saved = userRepository.save(user);
        activityLogService.log(saved.getId(), "CREATE", "USER", saved.getId(), "User created by admin");
        return userMapper.toDTO(saved);
    }

    @Override
    @Transactional
    public UserDTO updateUser(Long id, UpdateUserDTO request) {
        User user = getUserEntity(id);

        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            String email = request.getEmail().trim().toLowerCase();
            if (!email.equalsIgnoreCase(user.getEmail()) && userRepository.existsByEmailIgnoreCase(email)) {
                throw new BadRequestException("Email already exists");
            }
            user.setEmail(email);
        }

        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName().trim());
        }

        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }

        if (request.getActive() != null) {
            user.setActive(request.getActive());
        }

        User saved = userRepository.save(user);
        activityLogService.log(saved.getId(), "UPDATE", "USER", saved.getId(), "User details updated");
        return userMapper.toDTO(saved);
    }

    @Override
    @Transactional
    public UserDTO updateUserRole(Long id, UpdateUserDTO request) {
        if (request.getRole() == null) {
            throw new BadRequestException("Role is required");
        }

        User user = getUserEntity(id);
        user.setRole(request.getRole());
        User saved = userRepository.save(user);
        activityLogService.log(saved.getId(), "UPDATE_ROLE", "USER", saved.getId(), "User role changed to " + saved.getRole());
        return userMapper.toDTO(saved);
    }

    @Override
    @Transactional
    public void deactivateUser(Long id) {
        User user = getUserEntity(id);
        user.setActive(false);
        userRepository.save(user);
        activityLogService.log(user.getId(), "DEACTIVATE", "USER", user.getId(), "User deactivated");
    }

    @Override
    @Transactional
    public UserDTO updateProfile(String email, String fullName) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setFullName(fullName.trim());
        User saved = userRepository.save(user);
        activityLogService.log(saved.getId(), "UPDATE_PROFILE", "USER", saved.getId(), "Profile updated");
        return userMapper.toDTO(saved);
    }

    private User getUserEntity(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }
}