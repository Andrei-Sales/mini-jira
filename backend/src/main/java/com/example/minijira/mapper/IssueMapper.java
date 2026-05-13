package com.example.minijira.mapper;

import com.example.minijira.dto.IssueDTO;
import com.example.minijira.entity.Issue;
import org.springframework.stereotype.Component;

@Component
public class IssueMapper {
    private final UserMapper userMapper;

    public IssueMapper(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    public IssueDTO toDTO(Issue issue) {
        if (issue == null) {
            return null;
        }
        return IssueDTO.builder()
                .id(issue.getId())
                .issueKey(issue.getIssueKey())
                .title(issue.getTitle())
                .description(issue.getDescription())
                .type(issue.getType())
                .status(issue.getStatus())
                .priority(issue.getPriority())
                .projectId(issue.getProject().getId())
                .reporter(userMapper.toDTO(issue.getReporter()))
                .assignee(userMapper.toDTO(issue.getAssignee()))
                .dueDate(issue.getDueDate())
                .createdAt(issue.getCreatedAt())
                .updatedAt(issue.getUpdatedAt())
                .build();
    }
}
