package com.plozdev.smartfxapplication.dto;

import com.plozdev.smartfxapplication.model.EdgeInput;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class InjectedResponse {
    private String status;
    private String msg;
    private EdgeInput injectedEdge;
    private String estimatedProfit;
    private String nextStep;
    private String expectedResult;

}
