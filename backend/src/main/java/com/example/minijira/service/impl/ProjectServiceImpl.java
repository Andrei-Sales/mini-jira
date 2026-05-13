package com.example.minijira.service.impl;

import com.example.minijira.dto.CreateProjectDTO;
import com.example.minijira.dto.ProjectDTO;
import com.example.minijira.dto.UpdateProjectDTO;
import com.example.minijira.entity.Project;
import com.example.minijira.entity.User;
import com.example.minijira.enums.ProjectStatus;
import com.example.minijira.exception.BadRequestException;
import com.example.minijira.exception.ResourceNotFoundException;
import com.example.minijira.mapper.ProjectMapper;
import com.example.minijira.repository.ProjectRepository;
import com.example.minijira.repository.UserRepository;
import com.example.minijira.service.ActivityLogService;
import com.example.minijira.service.ProjectService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

@Service
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ProjectMapper projectMapper;
    private final ActivityLogService activityLogService;

    public ProjectServiceImpl(ProjectRepository projectRepository,
                              UserRepository userRepository,
                              ProjectMapper projectMapper,
                              ActivityLogService activityLogService) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.projectMapper = projectMapper;
        this.activityLogService = activityLogService;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProjectDTO> getProjects(Pageable pageable) {
        return projectRepository.findAll(pageable).map(projectMapper::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public ProjectDTO getProjectById(Long id) {
        return projectMapper.toDTO(getProjectEntity(id));
    }

    @Override
    @Transactional
    public ProjectDTO createProject(CreateProjectDTO request, Long actorUserId) {
        String normalizedKey = normalizeProjectKey(request.getProjectKey());
        if (projectRepository.existsByProjectKeyIgnoreCase(normalizedKey)) {
            throw new BadRequestException("Project key already exists");
        }

        Long leadId = request.getLeadId() != null ? request.getLeadId() : actorUserId;
        User lead = getUserEntity(leadId);

        Set<User> members = new HashSet<>();
        members.add(lead);

        Project project = Project.builder()
                .projectKey(normalizedKey)
                .name(request.getName().trim())
                .description(request.getDescription())
                .status(ProjectStatus.ACTIVE)
                .lead(lead)
                .members(members)
                .build();

        Project saved = projectRepository.save(project);
        activityLogService.log(actorUserId, "CREATE", "PROJECT", saved.getId(), "Project created: " + saved.getProjectKey());
        return projectMapper.toDTO(saved);
    }

    @Override
    @Transactional
    public ProjectDTO updateProject(Long id, UpdateProjectDTO request, Long actorUserId) {
        Project project = getProjectEntity(id);

        if (request.getName() != null && !request.getName().isBlank()) {
            project.setName(request.getName().trim());
        }

        if (request.getDescription() != null) {
            project.setDescription(request.getDescription());
        }

        if (request.getStatus() != null) {
            project.setStatus(request.getStatus());
        }

        if (request.getLeadId() != null) {
            User lead = getUserEntity(request.getLeadId());
            project.setLead(lead);
            project.getMembers().add(lead);
        }

        Project saved = projectRepository.save(project);
        activityLogService.log(actorUserId, "UPDATE", "PROJECT", saved.getId(), "Project updated: " + saved.getProjectKey());
        return projectMapper.toDTO(saved);
    }

    @Override
    @Transactional
    public void deleteProject(Long id, Long actorUserId) {
        Project project = getProjectEntity(id);
        projectRepository.delete(project);
        activityLogService.log(actorUserId, "DELETE", "PROJECT", id, "Project deleted: " + project.getProjectKey());
    }

    @Override
    @Transactional
    public ProjectDTO assignMembers(Long id, Set<Long> memberIds, Long actorUserId) {
        Project project = getProjectEntity(id);

        Set<User> members = new HashSet<>(project.getMembers());
        for (Long memberId : memberIds) {
            User user = getUserEntity(memberId);
            if (!Boolean.TRUE.equals(user.getActive())) {
                throw new BadRequestException("Cannot assign inactive user: " + user.getEmail());
            }
            members.add(user);
        }

        project.setMembers(members);
        Project saved = projectRepository.save(project);
        activityLogService.log(actorUserId, "ASSIGN_MEMBERS", "PROJECT", saved.getId(), "Project members updated");
        return projectMapper.toDTO(saved);
    }

    @Override
    @Transactional
    public ProjectDTO removeMember(Long id, Long memberId, Long actorUserId) {
        Project project = getProjectEntity(id);
        getUserEntity(memberId);

        if (project.getLead().getId().equals(memberId)) {
            throw new BadRequestException("Cannot remove project lead from members");
        }

        project.getMembers().removeIf(member -> member.getId().equals(memberId));
        Project saved = projectRepository.save(project);
        activityLogService.log(actorUserId, "REMOVE_MEMBER", "PROJECT", saved.getId(), "Project member removed");
        return projectMapper.toDTO(saved);
    }

    private Project getProjectEntity(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));
    }

    private User getUserEntity(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    private String normalizeProjectKey(String key) {
        if (key == null || key.isBlank()) {
            throw new BadRequestException("Project key is required");
        }
        String normalized = key.trim().toUpperCase();
        if (!normalized.matches("^[A-Z][A-Z0-9]{1,9}$")) {
            throw new BadRequestException("Project key must be 2-10 chars and alphanumeric, starting with letter");
        }
        return normalized;
    }
}
