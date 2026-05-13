package com.example.minijira.service;

public interface ActivityLogService {
    void log(Long userId, String action, String entityType, Long entityId, String description);
}