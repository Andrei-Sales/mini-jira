package com.example.minijira.service;

import com.example.minijira.dto.ActivityLogDTO;
import com.example.minijira.dto.DashboardStatsDTO;

import java.util.List;

public interface DashboardService {
    DashboardStatsDTO getDashboardStats(Long userId);
    List<ActivityLogDTO> getRecentActivity();
}