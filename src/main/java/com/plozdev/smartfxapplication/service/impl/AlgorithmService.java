package com.plozdev.smartfxapplication.service.impl;

import com.plozdev.smartfxapplication.exception.InfiniteCycleException;
import com.plozdev.smartfxapplication.model.Edge;
import com.plozdev.smartfxapplication.model.EdgeInput;
import com.plozdev.smartfxapplication.model.Graph;
import com.plozdev.smartfxapplication.model.SPFAResult;
import com.plozdev.smartfxapplication.service.AlgorithmServiceI;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class AlgorithmService implements AlgorithmServiceI {

    @Override
    public SPFAResult findBestPath(Graph graph, int source) {
        int n = graph.size();

        double[] dist = new double[n];
        int[] parent = new int[n];// trace route
        boolean[] inQueue = new boolean[n];//track co trong queue chua
        int[] cnt = new int[n];//phat hien chu trinh am
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
                    if (!inQueue[v]) {
                        q.add(v);
                        inQueue[v] = true;
                        cnt[v]++;
                        if (cnt[v] > n)
                            return new SPFAResult(dist, parent, true);
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
                throw new InfiniteCycleException("Vòng lặp vô tận được phát hiện trong quá trình truy ngược đường đi! Hệ thống nghi ngờ có chu trình Arbitrage âm chèn ép dữ liệu.");
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
