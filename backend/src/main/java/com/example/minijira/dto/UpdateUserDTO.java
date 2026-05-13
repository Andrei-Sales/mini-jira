package com.example.minijira.dto;

import com.example.minijira.enums.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateUserDTO {
    @Email(message = "Email should be valid")
    private String email;

    @Size(min = 2, max = 100, message = "Full name should be between 2 and 100 characters")
    private String fullName;

    private UserRole role;

    private Boolean active;
}
