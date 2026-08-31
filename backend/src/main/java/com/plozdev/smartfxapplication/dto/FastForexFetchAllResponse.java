package com.plozdev.smartfxapplication.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.Map;

@JsonIgnoreProperties(ignoreUnknown = true)
@Data
@AllArgsConstructor
public class FastForexFetchAllResponse {
    private String base;
    @JsonProperty("results")
    private Map<String, Double> results;
    private String updated;
    private Double ms;
}
