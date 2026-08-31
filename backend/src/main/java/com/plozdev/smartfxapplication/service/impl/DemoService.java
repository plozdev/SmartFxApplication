package com.plozdev.smartfxapplication.service.impl;

import com.plozdev.smartfxapplication.dto.InjectedResponse;
import com.plozdev.smartfxapplication.dto.ResetResponse;
import com.plozdev.smartfxapplication.model.EdgeInput;
import com.plozdev.smartfxapplication.service.DemoServiceI;
import com.plozdev.smartfxapplication.service.GraphManagementI;
import com.plozdev.smartfxapplication.service.RateIngestionServiceI;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class DemoService implements DemoServiceI {

    private final RateIngestionServiceI rateService;
    private final GraphManagementI graph;

    @Value("${fastforex.transaction-fee:0.003}")
    private double transactionFee;


    /**
     * Reset demo: Fetch fresh rates from API (should have no arbitrage)
     */
    @Override
    public ResetResponse reset() {
        rateService.fetchRates();

        return ResetResponse.builder()
                .status("success")
                .msg("Reset to fresh API rates (no arbitrage)")
                .nextStep("Try /api/v1/exchange?from=USD&to=JPY&amount=100 (should succeed)")
                .build();
    }


    /**
     * Inject a single edge to create a 3-node arbitrage cycle
     * Cycle: USD → EUR (0.92) → JPY (151) → USD (0.0082)
     * Profit = 0.92 × 151 × 0.0082 ≈ 1.14 (14% gain per loop!)
     */
    @Override
    public InjectedResponse injectArbitrage(String from, String to, double rate) {
        EdgeInput iEdge = new EdgeInput(from, to, rate, transactionFee);
        graph.addEdge(iEdge);

        return InjectedResponse.builder()
                .status("success")
                .msg("Edge injected: " + from + " -> " + to + " (rate: " + rate + ")")
                .injectedEdge(iEdge)
                .nextStep("Call /api/v1/exchange to detect cycle")
                .expectedResult("ArbitrageFoundException with cycle path in response")
                .build();
    }
}
