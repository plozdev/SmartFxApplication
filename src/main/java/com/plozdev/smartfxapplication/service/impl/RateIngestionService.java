package com.plozdev.smartfxapplication.service.impl;

import com.plozdev.smartfxapplication.client.FastForexClient;
import com.plozdev.smartfxapplication.dto.FastForexFetchAllResponse;
import com.plozdev.smartfxapplication.model.EdgeInput;
import com.plozdev.smartfxapplication.service.GraphManagementI;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class RateIngestionService {

    private final GraphManagementI graphManagement;
    private final FastForexClient fastForexClient;

    @Value("${fastforex.base-currency:USD}")
    private String baseCurrency;

    @Value("${fastforex.transaction-fee:0.003}")
    private double transactionFee;

    // Runs at configurable interval (default 30 seconds)
    @Scheduled(fixedRateString = "${fastforex.rate-update-interval:30000}")
    public void fetchRates() {
        try {
            log.info("Fetching real exchange rates from FastForex (base: {})...", baseCurrency);

            FastForexFetchAllResponse response = fastForexClient.fetchAllRates(baseCurrency);

            if (response == null) {
                log.warn("Failed to fetch rates from FastForex, skipping update");
                return;
            }

            // 2️⃣ Derive tất cả edges (Direct + Reverse + Cross)
            List<EdgeInput> edges = fastForexClient.deriveAllEdges(response, transactionFee);

            if (edges.isEmpty()) {
                log.warn("No edges derived, graph not updated");
                return;
            }

            // 3️⃣ Update graph
            graphManagement.updateGraph(edges);
            log.info("Graph updated with {} edges from {} currencies",
                    edges.size(), response.getResults().size());

            // 4️⃣ Log some sample rates
            log.debug("Sample rates from API response:");
            response.getResults().entrySet().stream()
                    .limit(5)
                    .forEach(entry -> log.debug("  {} {} -> {} : {}", 
                            baseCurrency, "→", entry.getKey(), entry.getValue()));

        } catch (Exception e) {
            log.error("Error during rate ingestion", e);
        }
    }
}
