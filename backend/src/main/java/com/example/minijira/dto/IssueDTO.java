package com.example.minijira.dto;

import com.example.minijira.enums.IssueStatus;
import com.example.minijira.enums.IssuePriority;
import com.example.minijira.enums.IssueType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IssueDTO {
    private Long id;
    private String issueKey;
    private String title;
    private String description;
    private IssueType type;
    private IssueStatus status;
    private IssuePriority priority;
    private Long projectId;
    private UserDTO reporter;
    private UserDTO assignee;
    private LocalDateTime dueDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
