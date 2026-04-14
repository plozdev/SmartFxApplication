package com.plozdev.smartfxapplication.service.impl;

import com.plozdev.smartfxapplication.model.EdgeInput;
import com.plozdev.smartfxapplication.service.GraphManagementI;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class RateIngestionService {

    private final GraphManagementI graphManagement;
    private final Random random = new Random();

    // Runs every 30 seconds
    @Scheduled(fixedRate = 30000)
    public void fetchRates() {
        log.info("Fetching new currency exchange rates...");
        List<EdgeInput> edges = new ArrayList<>();
        
        // Cố định tỷ giá sát thực tế để tránh chu trình âm do random quá tay
        // Fee (phí giao dịch) sẽ triệt tiêu hoàn toàn khả năng có Arbitrage
        double usdSgd = 1.35;
        double sgdVnd = 18500.0;
        double eurUsd = 1.08;
        double gbpUsd = 1.25;
        double jpyUsd = 1.0 / 150.0; // 150 JPY = 1 USD

        // Tạo dao động siêu nhỏ để đảm bảo thị trường nhấp nháy nhưng LUÔN CÂN BẰNG
        edges.add(new EdgeInput("USD", "SGD", usdSgd * (1.0 + random.nextDouble() * 0.001), 0.003)); 
        edges.add(new EdgeInput("SGD", "VND", sgdVnd * (1.0 + random.nextDouble() * 0.001), 0.003));
        edges.add(new EdgeInput("USD", "VND", (usdSgd * sgdVnd) * (1.0 + random.nextDouble() * 0.001), 0.003)); // USD -> VND = USD -> SGD -> VND

        // Các cặp tỷ giá nghịch đảo được tính toán TOÁN HỌC ĐỂ KHÔNG BAO GIỜ LÃI
        // (Bạn luôn bị lỗ tiền phí 0.003 = 0.3%)
        edges.add(new EdgeInput("SGD", "USD", (1.0 / usdSgd) * (1.0 - random.nextDouble() * 0.001), 0.003));
        edges.add(new EdgeInput("VND", "SGD", (1.0 / sgdVnd) * (1.0 - random.nextDouble() * 0.001), 0.003));
        edges.add(new EdgeInput("VND", "USD", (1.0 / (usdSgd * sgdVnd)) * (1.0 - random.nextDouble() * 0.001), 0.003));

        // Các cặp ngoại tệ khác
        edges.add(new EdgeInput("EUR", "USD", eurUsd * (1.0 + random.nextDouble() * 0.001), 0.002));
        edges.add(new EdgeInput("USD", "EUR", (1.0 / eurUsd) * (1.0 - random.nextDouble() * 0.001), 0.002));
        
        edges.add(new EdgeInput("GBP", "USD", gbpUsd * (1.0 + random.nextDouble() * 0.001), 0.002));
        edges.add(new EdgeInput("USD", "GBP", (1.0 / gbpUsd) * (1.0 - random.nextDouble() * 0.001), 0.002));

        edges.add(new EdgeInput("JPY", "USD", jpyUsd * (1.0 + random.nextDouble() * 0.001), 0.002));
        edges.add(new EdgeInput("USD", "JPY", (1.0 / jpyUsd) * (1.0 - random.nextDouble() * 0.001), 0.002));
        
        graphManagement.updateGraph(edges);
        log.info("Graph updated with {} new edges.", edges.size());
        
        // Đoạn này in thẳng ra Console để bạn dễ Copy -> Test:
        log.info("----- CÁC TỶ GIÁ HIỆN TẠI ĐANG CHẠY -----");
        for (EdgeInput e : edges) {
            log.info(String.format(" %s -> %s : Rate=%.10f (Fee=%.10f%%)",
                    e.getFrom(), e.getTo(), e.getRate(), e.getFee() * 100));
        }
        log.info("-------------------------------------------");
    }
}
