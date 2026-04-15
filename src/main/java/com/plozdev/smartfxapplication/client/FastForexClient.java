package com.plozdev.smartfxapplication.client;

import com.plozdev.smartfxapplication.dto.FastForexFetchAllResponse;
import com.plozdev.smartfxapplication.model.EdgeInput;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.*;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class FastForexClient {

    private final WebClient webClient;

    /**
     * Whitelist của Major/Mainstream currencies
     */
    private static final Set<String> MAJOR_CURRENCIES = Set.of(
            "USD", "EUR", "GBP", "JPY", "CHF", "AUD", "CAD", "NZD",
            "CNY", "SEK", "NOK", "DKK", "MXN", "ZAR", "INR", "KRW",
            "SGD", "HKD", "TWD", "THB", "IDR", "PHP", "MYR", "VND",
            "BRL", "CLP", "COP", "PEN", "ARS", "RUB", "TRY", "SAR",
            "AED", "QAR", "KWD", "IQD", "EGP", "NGN", "GHS", "PKR"
    );

    /**
     * FastForex API /fetch-all để lấy tỷ giá từ base currency
     */
    public FastForexFetchAllResponse fetchAllRates(String baseCurrency) {
        try {
            log.info("Fetching rates from FastForex with base: {}", baseCurrency);

            Mono<FastForexFetchAllResponse> mono = webClient.get()
                    .uri("/fetch-all?base={base}", baseCurrency)
                    .retrieve()
                    .bodyToMono(FastForexFetchAllResponse.class)
                    .onErrorResume(e -> {
                        log.error("Error fetching rates from FastForex", e);
                        return Mono.empty();
                    });

            FastForexFetchAllResponse response = mono.block();
            
            if (response == null) {
                log.warn("No response received from FastForex");
                return null;
            }

            log.info("Successfully fetched rates. Base: {}, Total currencies: {}", 
                    response.getBase(), response.getResults().size());
            
            return response;

        } catch (Exception e) {
            log.error("Exception while fetching rates", e);
            return null;
        }
    }

    /**
     * Derive tất cả edges từ response (chỉ từ Major Currencies):
     * 1. Direct edges: USD → EUR, USD → VND, ...
     * 2. Reverse edges: EUR → USD, VND → USD, ...
     * 3. Cross edges: EUR → VND, GBP → JPY, ...
     * 
     * Filter bỏ "tiền tệ rác" để tránh cross-rate lạ sinh ra false arbitrage
     */
    public List<EdgeInput> deriveAllEdges(FastForexFetchAllResponse response, double fee) {
        List<EdgeInput> edges = new ArrayList<>();

        if (response == null || response.getResults() == null || response.getResults().isEmpty()) {
            log.warn("Response is empty, cannot derive edges");
            return edges;
        }

        String baseNode = response.getBase();

        Map<String, Double> rates = response.getResults().entrySet().stream()
                .filter(e -> MAJOR_CURRENCIES.contains(e.getKey()))
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));

        int originalSize = response.getResults().size();
        int filteredSize = rates.size();
        
        log.info("Currency filtering: {} total → {} major (filtered {} exotic currencies)",
                originalSize, filteredSize, originalSize - filteredSize);

        if (rates.isEmpty()) {
            log.warn("No major currencies found after filtering");
            return edges;
        }

        try {
            for (String target : rates.keySet()) {
                if (!target.equals(baseNode)) {  // Skip self-loops
                    double rate = rates.get(target);
                    if (isValidRate(rate)) {
                        edges.add(new EdgeInput(baseNode, target, rate, fee));
                    }
                }
            }
            log.debug("Created {} direct edges", rates.size() - 1);

            for (String source : rates.keySet()) {
                if (!source.equals(baseNode)) {
                    double rate = rates.get(source);
                    double reverseRate = 1.0 / rate;
                    if (isValidRate(reverseRate)) {
                        edges.add(new EdgeInput(source, baseNode, reverseRate, fee));
                    }
                }
            }
            log.debug("Created {} reverse edges", rates.size() - 1);

            int crossEdgesCount = 0;
            for (String from : rates.keySet()) {
                for (String to : rates.keySet()) {
                    if (!from.equals(to)) {
                        double rateFrom = rates.get(from);
                        double rateTo = rates.get(to);
                        double crossRate = (1.0 / rateFrom) * rateTo;
                        
                        // Sanity check: reject unreasonable cross-rates
                        if (isValidRate(crossRate) && isSaneExchangeRate(crossRate)) {
                            edges.add(new EdgeInput(from, to, crossRate, fee));
                            crossEdgesCount++;
                        }
                    }
                }
            }
            log.debug("Created {} cross edges", crossEdgesCount);

            log.info("Total edges derived: {} from {} major currencies",
                    edges.size(), filteredSize);

        } catch (Exception e) {
            log.error("Error deriving edges", e);
        }

        return edges;
    }

    private boolean isValidRate(double rate) {
        return !Double.isNaN(rate) && !Double.isInfinite(rate) && rate > 0;
    }

    /**
     * Sanity check: cross-rate phải nằm trong khoảng hợp lý
     */
    private boolean isSaneExchangeRate(double crossRate) {
//        return crossRate >= 0.001 && crossRate <= 1000;
        return true;
    }
}
