package com.example.minijira.dto;

import com.example.minijira.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponseDTO {
    private String token;
    private Long userId;
    private String email;
    private String fullName;
    private UserRole role;
}
