package com.plozdev.smartfxapplication.controller;

import com.plozdev.smartfxapplication.dto.ExchangeResponse;
import com.plozdev.smartfxapplication.exception.InvalidCurrencyException;
import com.plozdev.smartfxapplication.exception.NoPathFoundException;
import com.plozdev.smartfxapplication.model.Graph;
import com.plozdev.smartfxapplication.model.SPFAResult;
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

        if (from == null || from.isBlank() || to == null || to.isBlank()) {
            throw new InvalidCurrencyException("Currencies 'from' and 'to' cannot be empty");
        }

        Graph snapshot = graphManagement.getGraphSnapshot();

        if (!snapshot.getId().containsKey(from) || !snapshot.getId().containsKey(to)) {
            throw new InvalidCurrencyException("Currency not supported in the current graph");
        }

        int sourceId = snapshot.getId(from);
        int targetId = snapshot.getId(to);

        SPFAResult result = algorithmService.findBestPath(snapshot, sourceId);

        // check if target is reachable
        if (result == null || result.getDist()[targetId] == Double.MAX_VALUE) {
            throw new NoPathFoundException("No exchange path found from " + from + " to " + to);
        }

        List<Integer> pathIds = algorithmService.getPath(targetId, result.getParent());
        List<String> stringPath = algorithmService.toCurrencyPath(snapshot, pathIds);

        double finalRate = Math.exp(-result.getDist()[targetId]);
        double finalAmount = amount * finalRate;

        ExchangeResponse response = new ExchangeResponse(
                from,
                to,
                amount,
                finalAmount,
                finalRate,
                stringPath
        );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/currencies")
    @Operation(summary = "Get a list of all currently supported currencies for the Dropdown")
    public ResponseEntity<List<String>> getAvailableCurrencies() {
        Graph snapshot = graphManagement.getGraphSnapshot();
        return ResponseEntity.ok(snapshot.getReverse());
    }
}
