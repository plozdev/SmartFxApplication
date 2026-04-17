package com.plozdev.smartfxapplication.controller;

import com.plozdev.smartfxapplication.dto.InjectedResponse;
import com.plozdev.smartfxapplication.dto.ResetResponse;
import com.plozdev.smartfxapplication.service.DemoServiceI;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
/**
 * Demo Controller - For testing SPFA arbitrage detection
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
