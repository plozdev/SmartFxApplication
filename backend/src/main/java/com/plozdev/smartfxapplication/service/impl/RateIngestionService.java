package com.plozdev.smartfxapplication.service.impl;

import com.plozdev.smartfxapplication.client.FastForexClient;
import com.plozdev.smartfxapplication.dto.FastForexFetchAllResponse;
import com.plozdev.smartfxapplication.model.EdgeInput;
import com.plozdev.smartfxapplication.service.GraphManagementI;
import com.plozdev.smartfxapplication.service.RateIngestionServiceI;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class RateIngestionService implements RateIngestionServiceI {

    private final GraphManagementI graphManagement;
    private final FastForexClient fastForexClient;

    @Value("${fastforex.base-currency:USD}")
    private String baseCurrency;

    @Value("${fastforex.transaction-fee:0.003}")
    private double transactionFee;

    // Runs at configurable interval (default 30 seconds)
    @Scheduled(fixedRateString = "${fastforex.rate-update-interval:30000}")
    @Override
    public void fetchRates() {
        try {
            log.info("Fetching real exchange rates from FastForex (base: {})...", baseCurrency);

            FastForexFetchAllResponse response = fastForexClient.fetchAllRates(baseCurrency);

            if (response == null) {
                log.warn("Failed to fetch rates from FastForex, skipping update");
                return;
            }

            List<EdgeInput> edges = fastForexClient.deriveAllEdges(response, transactionFee);

            if (edges.isEmpty()) {
                log.warn("No edges derived, graph not updated");
                return;
            }

            graphManagement.updateGraph(edges);
            log.info("Graph updated with {} edges from {} currencies",
                    edges.size(), response.getResults().size());

            log.debug("Sample rates from API response:");
            response.getResults().entrySet().stream()
                    .limit(5)
                    .forEach(entry -> log.debug("  {} {} -> {} : {}", 
                            baseCurrency, "→", entry.getKey(), entry.getValue()));

            log.info("   Edges: {} | Currencies: {}",
                    edges.size(), response.getResults().size());
        } catch (Exception e) {
            log.error("Error during rate ingestion", e);
        }
    }
}
