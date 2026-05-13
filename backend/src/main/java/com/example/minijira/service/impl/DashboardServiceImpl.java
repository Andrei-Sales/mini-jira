package com.example.minijira.service.impl;

import com.example.minijira.dto.ActivityLogDTO;
import com.example.minijira.dto.DashboardStatsDTO;
import com.example.minijira.enums.IssueStatus;
import com.example.minijira.mapper.ActivityLogMapper;
import com.example.minijira.repository.ActivityLogRepository;
import com.example.minijira.repository.IssueRepository;
import com.example.minijira.repository.ProjectRepository;
import com.example.minijira.service.DashboardService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DashboardServiceImpl implements DashboardService {

    private final ProjectRepository projectRepository;
    private final IssueRepository issueRepository;
    private final ActivityLogRepository activityLogRepository;
    private final ActivityLogMapper activityLogMapper;

    public DashboardServiceImpl(ProjectRepository projectRepository,
                                IssueRepository issueRepository,
                                ActivityLogRepository activityLogRepository,
                                ActivityLogMapper activityLogMapper) {
        this.projectRepository = projectRepository;
        this.issueRepository = issueRepository;
        this.activityLogRepository = activityLogRepository;
        this.activityLogMapper = activityLogMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardStatsDTO getDashboardStats(Long userId) {
        Map<String, Long> issuesByStatus = Arrays.stream(IssueStatus.values())
                .collect(Collectors.toMap(Enum::name, issueRepository::countByStatus));

        return DashboardStatsDTO.builder()
                .totalProjects(projectRepository.count())
                .totalIssues(issueRepository.count())
                .issuesByStatus(issuesByStatus)
                .myIssuesCount(userId == null ? 0L : issueRepository.countByAssigneeId(userId))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ActivityLogDTO> getRecentActivity() {
        return activityLogRepository.findTop20ByOrderByCreatedAtDesc()
                .stream()
                .map(activityLogMapper::toDTO)
                .toList();
    }
}