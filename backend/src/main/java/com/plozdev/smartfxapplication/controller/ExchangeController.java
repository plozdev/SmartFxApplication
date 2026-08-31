package com.plozdev.smartfxapplication.controller;

import com.plozdev.smartfxapplication.dto.ExchangeResponse;
import com.plozdev.smartfxapplication.service.AlgorithmServiceI;
import com.plozdev.smartfxapplication.service.GraphManagementI;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "FX Controller", description = "Currency Exchange & Arbitrage operations")
public class ExchangeController {

    private final AlgorithmServiceI algorithmService;
    private final GraphManagementI graphManagement;

    @GetMapping("/exchange")
    @Operation(summary = "Find the most cost-effective path to transfer money between currencies")
    public ResponseEntity<ExchangeResponse> exchange(
            @RequestParam String from,
            @RequestParam String to,
            @RequestParam double amount) {

        ExchangeResponse response = algorithmService.findOptimalExchange(from, to, amount);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/currencies")
    @Operation(summary = "Get a list of all currently supported currencies for the Dropdown")
    public ResponseEntity<List<String>> getAvailableCurrencies() {
        return ResponseEntity.ok(graphManagement.getGraphSnapshot().getReverse());
    }
}
