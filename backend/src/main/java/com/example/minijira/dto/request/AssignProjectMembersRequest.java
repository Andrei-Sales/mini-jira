package com.example.minijira.dto.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.Set;

@Data
public class AssignProjectMembersRequest {
    @NotEmpty(message = "Member IDs are required")
    private Set<Long> memberIds;
}