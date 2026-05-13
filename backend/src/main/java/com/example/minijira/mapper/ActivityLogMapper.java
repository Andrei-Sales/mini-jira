package com.example.minijira.mapper;

import com.example.minijira.dto.ActivityLogDTO;
import com.example.minijira.entity.ActivityLog;
import org.springframework.stereotype.Component;

@Component
public class ActivityLogMapper {
    private final UserMapper userMapper;

    public ActivityLogMapper(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    public ActivityLogDTO toDTO(ActivityLog activityLog) {
        if (activityLog == null) {
            return null;
        }
        return ActivityLogDTO.builder()
                .id(activityLog.getId())
                .user(userMapper.toDTO(activityLog.getUser()))
                .action(activityLog.getAction())
                .entityType(activityLog.getEntityType())
                .entityId(activityLog.getEntityId())
                .description(activityLog.getDescription())
                .createdAt(activityLog.getCreatedAt())
                .build();
    }
}
