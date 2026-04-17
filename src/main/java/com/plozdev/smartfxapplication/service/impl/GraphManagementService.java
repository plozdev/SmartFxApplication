package com.plozdev.smartfxapplication.service.impl;

import com.plozdev.smartfxapplication.model.Edge;
import com.plozdev.smartfxapplication.model.EdgeInput;
import com.plozdev.smartfxapplication.model.Graph;
import com.plozdev.smartfxapplication.service.GraphManagementI;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;

@Service
public class GraphManagementService implements GraphManagementI {

    private Graph currentGraph = new Graph();
    private final ReadWriteLock lock = new ReentrantReadWriteLock();

    @Override
    public void updateGraph(List<EdgeInput> newEdges) {
        lock.writeLock().lock();
        try {
            Graph newGraph = new Graph();
            for (EdgeInput e : newEdges) {
                newGraph.addEdge(e.getFrom(), e.getTo(), e.getWeight());
            }
            this.currentGraph = newGraph;
        } finally {
            lock.writeLock().unlock();
        }
    }

    @Override
    public void addEdge(EdgeInput edgeInput) {
        lock.writeLock().lock();
        try {
            currentGraph.addEdge(edgeInput.getFrom(), edgeInput.getTo(), edgeInput.getWeight());
        } finally {
            lock.writeLock().unlock();
        }
    }

    @Override
    public Graph getGraphSnapshot() {
        lock.readLock().lock();
        try {
            // Re-copy the structures safely for thread-separated snapshot.
            Graph snapshot = new Graph();
            Map<String, Integer> copiedId = new HashMap<>(currentGraph.getId());
            List<String> copiedReverse = new ArrayList<>(currentGraph.getReverse());
            List<List<Edge>> copiedAdj = new ArrayList<>();

            for (List<Edge> edges : currentGraph.getAdj()) {
                List<Edge> newEdgesList = new ArrayList<>();
                for(Edge edge : edges) {
                    newEdgesList.add(new Edge(edge.getTo(), edge.getWeight()));
                }
                copiedAdj.add(newEdgesList);
            }
            
            snapshot.setId(copiedId);
            snapshot.setReverse(copiedReverse);
            snapshot.setAdj(copiedAdj);
            return snapshot;
        } finally {
            lock.readLock().unlock();
        }
    }
}
