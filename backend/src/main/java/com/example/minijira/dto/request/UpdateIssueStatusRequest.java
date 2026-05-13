package com.example.minijira.dto.request;

import com.example.minijira.enums.IssueStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateIssueStatusRequest {
    @NotNull(message = "Status is required")
    private IssueStatus status;
}