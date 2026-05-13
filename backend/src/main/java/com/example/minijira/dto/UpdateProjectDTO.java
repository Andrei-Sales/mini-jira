package com.example.minijira.dto;

import com.example.minijira.enums.ProjectStatus;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateProjectDTO {
    @Size(min = 2, max = 255, message = "Project name should be between 2 and 255 characters")
    private String name;

    private String description;

    private ProjectStatus status;

    private Long leadId;
}
