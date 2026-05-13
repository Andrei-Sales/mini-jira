package com.example.minijira.service;

import com.example.minijira.dto.CreateIssueDTO;
import com.example.minijira.dto.IssueDTO;
import com.example.minijira.dto.UpdateIssueDTO;
import com.example.minijira.enums.IssuePriority;
import com.example.minijira.enums.IssueStatus;
import com.example.minijira.enums.IssueType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface IssueService {
    Page<IssueDTO> getIssues(Long projectId,
                             Long assigneeId,
                             IssueStatus status,
                             IssuePriority priority,
                             IssueType type,
                             Pageable pageable);

    IssueDTO getIssueById(Long id);
    IssueDTO createIssue(CreateIssueDTO request, Long reporterId);
    IssueDTO updateIssue(Long id, UpdateIssueDTO request, Long actorUserId);
    IssueDTO updateIssueStatus(Long id, IssueStatus status, Long actorUserId);
    void deleteIssue(Long id, Long actorUserId);
}