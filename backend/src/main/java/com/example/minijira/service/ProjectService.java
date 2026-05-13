package com.example.minijira.service;

import com.example.minijira.dto.CreateProjectDTO;
import com.example.minijira.dto.ProjectDTO;
import com.example.minijira.dto.UpdateProjectDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Set;

public interface ProjectService {
    Page<ProjectDTO> getProjects(Pageable pageable);
    ProjectDTO getProjectById(Long id);
    ProjectDTO createProject(CreateProjectDTO request, Long actorUserId);
    ProjectDTO updateProject(Long id, UpdateProjectDTO request, Long actorUserId);
    void deleteProject(Long id, Long actorUserId);
    ProjectDTO assignMembers(Long id, Set<Long> memberIds, Long actorUserId);
    ProjectDTO removeMember(Long id, Long memberId, Long actorUserId);
}