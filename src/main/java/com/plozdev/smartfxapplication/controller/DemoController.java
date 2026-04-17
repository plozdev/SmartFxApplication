package com.plozdev.smartfxapplication.controller;

import com.plozdev.smartfxapplication.client.FastForexClient;
import com.plozdev.smartfxapplication.dto.FastForexFetchAllResponse;
import com.plozdev.smartfxapplication.dto.InjectedResponse;
import com.plozdev.smartfxapplication.dto.ResetResponse;
import com.plozdev.smartfxapplication.model.EdgeInput;
import com.plozdev.smartfxapplication.service.DemoServiceI;
import com.plozdev.smartfxapplication.service.GraphManagementI;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * Demo Controller - For testing SPFA arbitrage detection
 * 
 * Workflow:
 * 1. POST /reset → Fetch fresh rates from API (no arbitrage)
 * 2. POST /inject-arbitrage → Inject 1 edge to create profitable cycle
 * 3. Call /api/v1/exchange → SPFA detects arbitrage and throws exception
 */
@RestController
@RequestMapping("/api/v1/demo")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Demo", description = "Arbitrage detection demo endpoints")
public class DemoController {

    private final DemoServiceI service;
    private final FastForexClient fastForexClient;
    private final GraphManagementI graphManagement;

    @Value("${fastforex.base-currency:USD}")
    private String baseCurrency;

    @Value("${fastforex.transaction-fee:0.003}")
    private double transactionFee;

    @PostMapping("/reset")
    @Operation(summary = "Reset to fresh API rates (no arbitrage injected)")
    public ResponseEntity<ResetResponse> reset() {
        return ResponseEntity.ok(service.reset());
    }
    
    @PostMapping("/inject-arbitrage")
    @Operation(summary = "Inject 1 edge to create profitable 3-node arbitrage cycle")
    public ResponseEntity<InjectedResponse> injectArbitrage(
            @RequestParam(defaultValue = "JPY") String fromCurrency,
            @RequestParam(defaultValue = "USD") String toCurrency,
            @RequestParam(defaultValue = "0.0082") double injectedRate) {
        return ResponseEntity.ok(service.injectArbitrage(fromCurrency, toCurrency, injectedRate));
    }


}
