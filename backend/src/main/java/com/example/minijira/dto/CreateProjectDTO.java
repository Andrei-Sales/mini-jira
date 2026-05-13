package com.example.minijira.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateProjectDTO {
    @NotBlank(message = "Project key is required")
    @Size(min = 2, max = 10, message = "Project key should be between 2 and 10 characters")
    private String projectKey;

    @NotBlank(message = "Project name is required")
    @Size(min = 2, max = 255, message = "Project name should be between 2 and 255 characters")
    private String name;

    private String description;

    private Long leadId;
}
