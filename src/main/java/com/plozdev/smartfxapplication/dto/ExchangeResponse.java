package com.plozdev.smartfxapplication.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExchangeResponse {
    private String from;
    private String to;
    private double initialAmount;
    private double finalAmount;
    private double effectiveRate;
    private List<String> path;
}
