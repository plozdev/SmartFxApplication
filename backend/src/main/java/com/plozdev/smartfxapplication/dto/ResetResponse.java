package com.plozdev.smartfxapplication.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class ResetResponse {
    private String status;
    private String msg;
    private String nextStep;
}
