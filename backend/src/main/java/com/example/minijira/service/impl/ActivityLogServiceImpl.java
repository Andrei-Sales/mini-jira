package com.example.minijira.service.impl;

import com.example.minijira.entity.ActivityLog;
import com.example.minijira.entity.User;
import com.example.minijira.repository.ActivityLogRepository;
import com.example.minijira.repository.UserRepository;
import com.example.minijira.service.ActivityLogService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ActivityLogServiceImpl implements ActivityLogService {

    private final ActivityLogRepository activityLogRepository;
    private final UserRepository userRepository;

    public ActivityLogServiceImpl(ActivityLogRepository activityLogRepository, UserRepository userRepository) {
        this.activityLogRepository = activityLogRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public void log(Long userId, String action, String entityType, Long entityId, String description) {
        User user = null;
        if (userId != null) {
            user = userRepository.findById(userId).orElse(null);
        }

        ActivityLog activityLog = ActivityLog.builder()
                .user(user)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .description(description)
                .build();

        activityLogRepository.save(activityLog);
    }
}