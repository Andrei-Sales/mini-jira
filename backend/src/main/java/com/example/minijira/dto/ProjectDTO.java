package com.example.minijira.dto;

import com.example.minijira.enums.ProjectStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectDTO {
    private Long id;
    private String projectKey;
    private String name;
    private String description;
    private ProjectStatus status;
    private UserDTO lead;
    private Set<UserDTO> members;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
