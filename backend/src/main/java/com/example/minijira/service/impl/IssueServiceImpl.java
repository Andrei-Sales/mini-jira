package com.example.minijira.service.impl;

import com.example.minijira.dto.CreateIssueDTO;
import com.example.minijira.dto.IssueDTO;
import com.example.minijira.dto.UpdateIssueDTO;
import com.example.minijira.entity.Issue;
import com.example.minijira.entity.Project;
import com.example.minijira.entity.User;
import com.example.minijira.enums.IssuePriority;
import com.example.minijira.enums.IssueStatus;
import com.example.minijira.enums.IssueType;
import com.example.minijira.exception.ResourceNotFoundException;
import com.example.minijira.mapper.IssueMapper;
import com.example.minijira.repository.IssueRepository;
import com.example.minijira.repository.ProjectRepository;
import com.example.minijira.repository.UserRepository;
import com.example.minijira.service.ActivityLogService;
import com.example.minijira.service.IssueService;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class IssueServiceImpl implements IssueService {

    private final IssueRepository issueRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final IssueMapper issueMapper;
    private final ActivityLogService activityLogService;

    public IssueServiceImpl(IssueRepository issueRepository,
                            ProjectRepository projectRepository,
                            UserRepository userRepository,
                            IssueMapper issueMapper,
                            ActivityLogService activityLogService) {
        this.issueRepository = issueRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.issueMapper = issueMapper;
        this.activityLogService = activityLogService;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<IssueDTO> getIssues(Long projectId,
                                    Long assigneeId,
                                    IssueStatus status,
                                    IssuePriority priority,
                                    IssueType type,
                                    Pageable pageable) {
        Specification<Issue> specification = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (projectId != null) {
                predicates.add(cb.equal(root.get("project").get("id"), projectId));
            }
            if (assigneeId != null) {
                predicates.add(cb.equal(root.get("assignee").get("id"), assigneeId));
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (priority != null) {
                predicates.add(cb.equal(root.get("priority"), priority));
            }
            if (type != null) {
                predicates.add(cb.equal(root.get("type"), type));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return issueRepository.findAll(specification, pageable).map(issueMapper::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public IssueDTO getIssueById(Long id) {
        return issueMapper.toDTO(getIssueEntity(id));
    }

    @Override
    @Transactional
    public IssueDTO createIssue(CreateIssueDTO request, Long reporterId) {
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + request.getProjectId()));

        User reporter = userRepository.findById(reporterId)
                .orElseThrow(() -> new ResourceNotFoundException("Reporter not found"));

        User assignee = null;
        if (request.getAssigneeId() != null) {
            assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Assignee not found with id: " + request.getAssigneeId()));
        }

        Issue issue = Issue.builder()
                .issueKey(generateIssueKey(project))
                .title(request.getTitle().trim())
                .description(request.getDescription())
                .type(request.getType())
                .status(IssueStatus.TODO)
                .priority(request.getPriority())
                .project(project)
                .reporter(reporter)
                .assignee(assignee)
                .dueDate(request.getDueDate())
                .build();

        Issue saved = issueRepository.save(issue);
        activityLogService.log(reporterId, "CREATE", "ISSUE", saved.getId(), "Issue created: " + saved.getIssueKey());
        return issueMapper.toDTO(saved);
    }

    @Override
    @Transactional
    public IssueDTO updateIssue(Long id, UpdateIssueDTO request, Long actorUserId) {
        Issue issue = getIssueEntity(id);

        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            issue.setTitle(request.getTitle().trim());
        }

        if (request.getDescription() != null) {
            issue.setDescription(request.getDescription());
        }

        if (request.getStatus() != null) {
            issue.setStatus(request.getStatus());
        }

        if (request.getPriority() != null) {
            issue.setPriority(request.getPriority());
        }

        if (request.getAssigneeId() != null) {
            User assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Assignee not found with id: " + request.getAssigneeId()));
            issue.setAssignee(assignee);
        }

        if (request.getDueDate() != null) {
            issue.setDueDate(request.getDueDate());
        }

        Issue saved = issueRepository.save(issue);
        activityLogService.log(actorUserId, "UPDATE", "ISSUE", saved.getId(), "Issue updated: " + saved.getIssueKey());
        return issueMapper.toDTO(saved);
    }

    @Override
    @Transactional
    public IssueDTO updateIssueStatus(Long id, IssueStatus status, Long actorUserId) {
        Issue issue = getIssueEntity(id);
        issue.setStatus(status);
        Issue saved = issueRepository.save(issue);
        activityLogService.log(actorUserId, "MOVE", "ISSUE", saved.getId(), "Issue moved to " + status);
        return issueMapper.toDTO(saved);
    }

    @Override
    @Transactional
    public void deleteIssue(Long id, Long actorUserId) {
        Issue issue = getIssueEntity(id);
        issueRepository.delete(issue);
        activityLogService.log(actorUserId, "DELETE", "ISSUE", id, "Issue deleted: " + issue.getIssueKey());
    }

    private Issue getIssueEntity(Long id) {
        return issueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Issue not found with id: " + id));
    }

    private String generateIssueKey(Project project) {
        String prefix = project.getProjectKey() + "-";
        long sequence = issueRepository.countByProjectId(project.getId()) + 1;
        String candidate = prefix + sequence;

        while (issueRepository.existsByIssueKeyIgnoreCase(candidate)) {
            sequence++;
            candidate = prefix + sequence;
        }

        return candidate;
    }
}