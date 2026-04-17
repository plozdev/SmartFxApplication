package com.plozdev.smartfxapplication.controller;

import com.plozdev.smartfxapplication.client.FastForexClient;
import com.plozdev.smartfxapplication.dto.FastForexFetchAllResponse;
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
    public ResponseEntity<Map<String, Object>> injectArbitrage(
            @RequestParam(defaultValue = "JPY") String fromCurrency,
            @RequestParam(defaultValue = "USD") String toCurrency,
            @RequestParam(defaultValue = "0.0082") double injectedRate) {
        try {
            log.info("💉 Demo: Injecting arbitrage edge: {} → {} (rate: {})", 
                    fromCurrency, toCurrency, injectedRate);
            
            // Fetch fresh rates first
            FastForexFetchAllResponse response = fastForexClient.fetchAllRates(baseCurrency);
            
            if (response == null || response.getResults().isEmpty()) {
                log.error("❌ Failed to fetch rates from API");
                return ResponseEntity.badRequest()
                    .body(Map.of(
                        "status", "error",
                        "message", "Failed to fetch rates from API"
                    ));
            }
            
            // Derive all edges from API data
            List<EdgeInput> edges = fastForexClient.deriveAllEdges(response, transactionFee);
            
            // Inject the arbitrage edge
            EdgeInput arbitrageEdge = new EdgeInput(fromCurrency, toCurrency, injectedRate, transactionFee);
            edges.add(arbitrageEdge);
            
            // Update graph with injected edge
            graphManagement.updateGraph(edges);
            
            log.info("✅ Arbitrage injection complete");
            log.info("   Total edges: {} | Injected: {} → {} (rate: {})",
                    edges.size(), fromCurrency, toCurrency, injectedRate);
            
            // Calculate profit for this cycle
            double cycleProfit = calculateCycleProfit(response, fromCurrency, toCurrency, injectedRate);
            
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Arbitrage edge injected successfully",
                "injectedEdge", Map.of(
                    "from", fromCurrency,
                    "to", toCurrency,
                    "rate", injectedRate,
                    "weight", arbitrageEdge.getWeight()
                ),
                "estimatedProfit", String.format("%.2f%%", cycleProfit * 100),
                "nextStep", "Try /api/v1/exchange?from=USD&to=JPY&amount=100 (should detect arbitrage)",
                "expectedResult", "ArbitrageFoundException (negative cycle detected)"
            ));
            
        } catch (Exception e) {
            log.error("❌ Error during arbitrage injection", e);
            return ResponseEntity.badRequest()
                .body(Map.of(
                    "status", "error",
                    "message", e.getMessage()
                ));
        }
    }

    /**
     * Simple profit calculator for demo purposes
     * Estimates the profit from the injected cycle
     */
    private double calculateCycleProfit(FastForexFetchAllResponse response, 
                                       String injectedFrom, String injectedTo, 
                                       double injectedRate) {
        try {
            // Try to estimate: USD → EUR → JPY → USD
            var rates = response.getResults();  // Map<String, Double>
            
            // Base: 1 USD
            double usdAmount = 1.0;
            
            // USD → EUR (apply fee)
            double eurAmount = usdAmount * rates.getOrDefault("EUR", 0.92) * (1 - transactionFee);
            
            // EUR → JPY (cross-rate, apply fee)
            double jpy = rates.getOrDefault("JPY", 130.0);
            double eurToJpy = jpy / rates.getOrDefault("EUR", 0.92);
            double jpyAmount = eurAmount * eurToJpy * (1 - transactionFee);
            
            // JPY → USD (injected, apply fee)
            double usdFinal = jpyAmount * injectedRate * (1 - transactionFee);
            
            // Profit
            return usdFinal / usdAmount - 1.0;
            
        } catch (Exception e) {
            log.warn("Could not calculate cycle profit: {}", e.getMessage());
            return 0.14;  // Default estimate
        }
    }
}
