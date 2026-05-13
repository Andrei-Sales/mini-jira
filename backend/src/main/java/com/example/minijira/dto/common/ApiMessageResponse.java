package com.example.minijira.dto.common;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class ApiMessageResponse {
    String message;
}