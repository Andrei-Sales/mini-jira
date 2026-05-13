package com.example.minijira.dto;

import com.example.minijira.enums.IssuePriority;
import com.example.minijira.enums.IssueType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateIssueDTO {
    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 500, message = "Title should be between 3 and 500 characters")
    private String title;

    private String description;

    @NotNull(message = "Type is required")
    private IssueType type;

    @NotNull(message = "Priority is required")
    private IssuePriority priority;

    @NotNull(message = "Project ID is required")
    private Long projectId;

    private Long assigneeId;

    private LocalDateTime dueDate;
}
