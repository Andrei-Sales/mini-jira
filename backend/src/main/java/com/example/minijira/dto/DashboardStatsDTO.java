package com.example.minijira.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsDTO {
    private Long totalProjects;
    private Long totalIssues;
    private Map<String, Long> issuesByStatus;
    private Long myIssuesCount;
}
