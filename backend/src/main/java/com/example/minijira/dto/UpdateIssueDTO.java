package com.example.minijira.dto;

import com.example.minijira.enums.IssueStatus;
import com.example.minijira.enums.IssuePriority;
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
public class UpdateIssueDTO {
    @Size(min = 3, max = 500, message = "Title should be between 3 and 500 characters")
    private String title;

    private String description;

    private IssueStatus status;

    private IssuePriority priority;

    private Long assigneeId;

    private LocalDateTime dueDate;
}
