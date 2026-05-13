package com.example.minijira.mapper;

import com.example.minijira.dto.ProjectDTO;
import com.example.minijira.entity.Project;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class ProjectMapper {
    private final UserMapper userMapper;

    public ProjectMapper(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    public ProjectDTO toDTO(Project project) {
        if (project == null) {
            return null;
        }
        return ProjectDTO.builder()
                .id(project.getId())
                .projectKey(project.getProjectKey())
                .name(project.getName())
                .description(project.getDescription())
                .status(project.getStatus())
                .lead(userMapper.toDTO(project.getLead()))
                .members(project.getMembers().stream()
                        .map(userMapper::toDTO)
                        .collect(Collectors.toSet()))
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .build();
    }
}
