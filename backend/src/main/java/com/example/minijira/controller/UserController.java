package com.example.minijira.controller;

import com.example.minijira.dto.CreateUserDTO;
import com.example.minijira.dto.UpdateUserDTO;
import com.example.minijira.dto.UserDTO;
import com.example.minijira.dto.common.ApiMessageResponse;
import com.example.minijira.dto.common.PageResponse;
import com.example.minijira.dto.request.UpdateUserRoleRequest;
import com.example.minijira.service.UserService;
import com.example.minijira.util.PageUtils;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public PageResponse<UserDTO> getUsers(@RequestParam(required = false) Boolean active,
                                          @RequestParam(required = false) String search,
                                          @RequestParam(defaultValue = "0") int page,
                                          @RequestParam(defaultValue = "10") int size,
                                          @RequestParam(defaultValue = "createdAt") String sortBy,
                                          @RequestParam(defaultValue = "desc") String sortDir) {
        Sort sort = "asc".equalsIgnoreCase(sortDir) ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Page<UserDTO> users = userService.getUsers(active, search, PageRequest.of(page, size, sort));
        return PageUtils.from(users);
    }

    @GetMapping("/{id}")
    public UserDTO getUser(@PathVariable Long id) {
        return userService.getUserById(id);
    }

    @PostMapping
    public UserDTO createUser(@Valid @RequestBody CreateUserDTO request) {
        return userService.createUser(request);
    }

    @PutMapping("/{id}")
    public UserDTO updateUser(@PathVariable Long id, @Valid @RequestBody UpdateUserDTO request) {
        return userService.updateUser(id, request);
    }

    @PatchMapping("/{id}/role")
    public UserDTO updateRole(@PathVariable Long id, @Valid @RequestBody UpdateUserRoleRequest request) {
        UpdateUserDTO dto = UpdateUserDTO.builder().role(request.getRole()).build();
        return userService.updateUserRole(id, dto);
    }

    @PatchMapping("/{id}/deactivate")
    public ApiMessageResponse deactivateUser(@PathVariable Long id) {
        userService.deactivateUser(id);
        return ApiMessageResponse.builder().message("User deactivated successfully").build();
    }
}