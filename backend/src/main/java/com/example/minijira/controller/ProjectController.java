package com.example.minijira.controller;

import com.example.minijira.dto.CreateProjectDTO;
import com.example.minijira.dto.ProjectDTO;
import com.example.minijira.dto.UpdateProjectDTO;
import com.example.minijira.dto.UserDTO;
import com.example.minijira.dto.common.ApiMessageResponse;
import com.example.minijira.dto.common.PageResponse;
import com.example.minijira.dto.request.AssignProjectMembersRequest;
import com.example.minijira.service.ProjectService;
import com.example.minijira.service.UserService;
import com.example.minijira.util.PageUtils;
import com.example.minijira.util.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;
    private final UserService userService;

    public ProjectController(ProjectService projectService, UserService userService) {
        this.projectService = projectService;
        this.userService = userService;
    }

    @GetMapping
    public PageResponse<ProjectDTO> getProjects(@RequestParam(defaultValue = "0") int page,
                                                @RequestParam(defaultValue = "10") int size,
                                                @RequestParam(defaultValue = "createdAt") String sortBy,
                                                @RequestParam(defaultValue = "desc") String sortDir) {
        Sort sort = "asc".equalsIgnoreCase(sortDir) ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Page<ProjectDTO> projects = projectService.getProjects(PageRequest.of(page, size, sort));
        return PageUtils.from(projects);
    }

    @GetMapping("/member-candidates")
    @PreAuthorize("hasAnyRole('ADMIN','PROJECT_MANAGER')")
    public PageResponse<UserDTO> getMemberCandidates(@RequestParam(defaultValue = "0") int page,
                                                     @RequestParam(defaultValue = "100") int size,
                                                     @RequestParam(required = false) String search) {
        Page<UserDTO> users = userService.getUsers(true, search, PageRequest.of(page, size, Sort.by("fullName").ascending()));
        return PageUtils.from(users);
    }

    @GetMapping("/{id}")
    public ProjectDTO getProject(@PathVariable Long id) {
        return projectService.getProjectById(id);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','PROJECT_MANAGER')")
    public ProjectDTO createProject(@Valid @RequestBody CreateProjectDTO request) {
        return projectService.createProject(request, SecurityUtils.getCurrentUserId());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PROJECT_MANAGER')")
    public ProjectDTO updateProject(@PathVariable Long id, @Valid @RequestBody UpdateProjectDTO request) {
        return projectService.updateProject(id, request, SecurityUtils.getCurrentUserId());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PROJECT_MANAGER')")
    public ApiMessageResponse deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id, SecurityUtils.getCurrentUserId());
        return ApiMessageResponse.builder().message("Project deleted successfully").build();
    }

    @PostMapping("/{id}/members")
    @PreAuthorize("hasAnyRole('ADMIN','PROJECT_MANAGER')")
    public ProjectDTO assignMembers(@PathVariable Long id, @Valid @RequestBody AssignProjectMembersRequest request) {
        return projectService.assignMembers(id, request.getMemberIds(), SecurityUtils.getCurrentUserId());
    }

    @DeleteMapping("/{id}/members/{memberId}")
    @PreAuthorize("hasAnyRole('ADMIN','PROJECT_MANAGER')")
    public ProjectDTO removeMember(@PathVariable Long id, @PathVariable Long memberId) {
        return projectService.removeMember(id, memberId, SecurityUtils.getCurrentUserId());
    }
}
