package com.plozdev.smartfxapplication.service.impl;

import com.plozdev.smartfxapplication.dto.ExchangeResponse;
import com.plozdev.smartfxapplication.exception.ArbitrageFoundException;
import com.plozdev.smartfxapplication.exception.InfiniteCycleException;
import com.plozdev.smartfxapplication.exception.InvalidCurrencyException;
import com.plozdev.smartfxapplication.exception.NoPathFoundException;
import com.plozdev.smartfxapplication.model.Edge;
import com.plozdev.smartfxapplication.model.Graph;
import com.plozdev.smartfxapplication.model.SPFAResult;
import com.plozdev.smartfxapplication.service.AlgorithmServiceI;
import com.plozdev.smartfxapplication.service.GraphManagementI;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class AlgorithmService implements AlgorithmServiceI {

    private final GraphManagementI graphManagement;

    /**
     * Main Business Logic: Find optimal exchange path
     * Validates currencies → Runs SPFA → Detects arbitrage → Calculates result
     */
    @Override
    public ExchangeResponse findOptimalExchange(String from, String to, double amount) {
        log.info("Finding optimal exchange path: {} -> {} (amount: {})", from, to, amount);

        // Validate currencies
        if (from == null || from.isBlank() || to == null || to.isBlank()) {
            throw new InvalidCurrencyException("Currencies 'from' and 'to' cannot be empty");
        }

        // Validate amount (must be positive)
        if (amount <= 0) {
            throw new IllegalArgumentException("Amount must be greater than 0");
        }

        // Normalize currency codes to uppercase (case-insensitive)
        from = from.trim().toUpperCase(java.util.Locale.ROOT);
        to = to.trim().toUpperCase(java.util.Locale.ROOT);

        Graph snapshot = graphManagement.getGraphSnapshot();

        if (!snapshot.getId().containsKey(from) || !snapshot.getId().containsKey(to)) {
            throw new InvalidCurrencyException("Currency not supported in the current graph");
        }

        int sourceId = snapshot.getId(from);
        int targetId = snapshot.getId(to);

        SPFAResult result = findBestPath(snapshot, sourceId);

        if (result == null || result.getDist()[targetId] == Double.MAX_VALUE) {
            throw new NoPathFoundException("No exchange path found from " + from + " to " + to);
        }

        List<Integer> pathIds = getPath(targetId, result.getParent());
        List<String> currencyPath = toCurrencyPath(snapshot, pathIds);

        double finalRate = Math.exp(-result.getDist()[targetId]);
        double finalAmount = amount * finalRate;

        log.info("Exchange found: {} → {} with rate {}", from, to, finalRate);

        return ExchangeResponse.builder()
                .from(from)
                .to(to)
                .initialAmount(amount)
                .finalAmount(finalAmount)
                .effectiveRate(finalRate)
                .path(currencyPath)
                .build();
    }

    @Override
    public List<Integer> findArbitrage(int []parent, int n, int cycleNode) {
        int x = cycleNode;
        for (int i = 0; i < n; ++i)
            x = parent[x];

        List<Integer> cycle = new ArrayList<>();
        for (int v = x;; v = parent[v]) {
            cycle.add(v);
            if (v == x && cycle.size() > 1)
                break;
        }
        Collections.reverse(cycle);
        return cycle;
    }

    @Override
    public SPFAResult findBestPath(Graph graph, int source) {
        int n = graph.size();

        double[] dist = new double[n];
        int[] parent = new int[n];
        boolean[] inQueue = new boolean[n];
        int[] cnt = new int[n];
        Queue<Integer> q = new LinkedList<>();

        Arrays.fill(dist, Double.MAX_VALUE);
        Arrays.fill(parent, -1);
        Arrays.fill(inQueue, false);

        dist[source] = 0;
        q.add(source);
        inQueue[source] = true;

        while (!q.isEmpty()) {
            int u = q.poll();
            inQueue[u] = false;

            for (Edge e : graph.getNeighbors(u)) {
                int v = e.getTo();
                double w = e.getWeight();

                if (dist[u] + w < dist[v]) {
                    dist[v] = dist[u] + w;
                    parent[v] = u;
                    cnt[v]++;

                    if (cnt[v] >= n) {
                        List<Integer> cycleIds = findArbitrage(parent, n, v);
                        List<String> cyclePath = toCurrencyPath(graph, cycleIds);
                        log.warn("Arbitrage cycle: {}", cyclePath);
                        throw new ArbitrageFoundException(
                            "Arbitrage detected! Cycle: " + String.join(" -> ", cyclePath),
                            cyclePath
                        );
                    }

                    if (!inQueue[v]) {
                        q.add(v);
                        inQueue[v] = true;
                    }
                }
            }
        }

        return new SPFAResult(dist, parent, false);
    }

    @Override
    public List<Integer> getPath(int target, int[] parent) {
        List<Integer> path = new ArrayList<>();
        Set<Integer> vis = new HashSet<>();

        for (int cur = target; cur != -1; cur = parent[cur]) {
            if (vis.contains(cur))
                throw new InfiniteCycleException("Infinite loop detected during path reconstruction! System suspects a negative arbitrage cycle.");
            path.add(cur);
            vis.add(cur);
        }

        Collections.reverse(path);
        return path;
    }

    @Override
    public List<String> toCurrencyPath(Graph g, List<Integer> path) {
        List<String> res = new ArrayList<>();
        for (int id : path) {
            res.add(g.getName(id));
        }
        return res;
    }
}
