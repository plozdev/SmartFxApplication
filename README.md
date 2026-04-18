# SmartFX Application

A Spring Boot application that finds optimal currency exchange paths using graph algorithms and detects arbitrage opportunities in real-time.

## Quick Start

### Prerequisites
- Java 25+
- Maven 3.9+
- FastForex API key ([get free trial](https://www.fastforex.io))

### Setup

1. **Clone & navigate**
   ```bash
   git clone https://github.com/plozdev/SmartFXApplication.git
   cd SmartFXApplication
   ```

2. **Configure API key** - Create `src/main/resources/application-local.yaml`:
   ```yaml
   fastforex:
     api-key: YOUR_FASTFOREX_API_KEY_HERE
     base-url: https://api.fastforex.io
     base-currency: USD
   ```

3. **Build & run**
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```

   Access the app at `http://localhost:8080`

## Features

- **Optimal Path Finding** - Uses SPFA (Bellman-Ford) algorithm to find best exchange routes
- **Arbitrage Detection** - Identifies profitable negative cycles in real-time
- **Real-time Rates** - Updates exchange rates every 30 seconds from FastForex API
- **40+ Currencies** - Supports major global currencies
- **Thread-Safe** - Concurrent access with ReadWriteLock
- **API Documentation** - Interactive Swagger UI at `/swagger-ui.html`

## API Endpoints

### Exchange Rates

**Find optimal exchange path**
```
GET /api/v1/exchange?from=USD&to=VND&amount=1000
```

Response:
```json
{
  "from": "USD",
  "to": "VND",
  "initialAmount": 1000,
  "finalAmount": 24500000.50,
  "effectiveRate": 24500.00050,
  "path": ["USD", "VND"]
}
```

Errors:
- `400 InvalidCurrencyException` - Currency not supported
- `404 NoPathFoundException` - No exchange path available
- `400 ArbitrageFoundException` - Profitable cycle detected (includes `arbitrageCycle` details)

**Get available currencies**
```
GET /api/v1/currencies
```

Returns: `["USD", "EUR", "GBP", "JPY", ...]`

### Demo & Testing

**Reset to fresh API rates**
```
POST /api/v1/demo/reset
```

**Inject arbitrage edge** (for testing)
```
POST /api/v1/demo/inject-arbitrage?from=JPY&to=USD&rate=0.0082
```

### Demo Workflow

```bash
# 1. Reset graph to clean state
curl -X POST http://localhost:8080/api/v1/demo/reset

# 2. Normal exchange (should succeed)
curl "http://localhost:8080/api/v1/exchange?from=USD&to=JPY&amount=100"

# 3. Inject profitable edge to trigger arbitrage
curl -X POST "http://localhost:8080/api/v1/demo/inject-arbitrage?from=JPY&to=USD&rate=0.0082"

# 4. Now arbitrage is detected
curl "http://localhost:8080/api/v1/exchange?from=USD&to=JPY&amount=100"
# Response (400): Arbitrage detected! Cycle: USD -> EUR -> JPY -> USD
```

## Technology Stack

| Component | Technology |
|-----------|-----------|
| Framework | Spring Boot 4.0.5 |
| Java | JDK 25 |
| HTTP Client | WebFlux (async) |
| API Docs | SpringDoc OpenAPI 3.0.2 |
| Build | Maven 3.9+ |
| Logging | SLF4J + Logback |

## How It Works

### SPFA Algorithm
- **Purpose**: Find shortest path in graph with negative weights (exchange rates)
- **Complexity**: O(E) to O(nE) depending on graph structure
- **Speed**: ~5-10ms for 40 currencies + 1600 edges
- **Arbitrage Detection**: Identifies negative cycles that indicate profit opportunities

### Weight Transformation
Exchange rates are converted to weights using: `Weight = -log(Rate × (1 - Fee))`

This converts the multiplication problem (finding max product path) into an addition problem (finding min weight path), which SPFA can solve efficiently.

### Graph Construction
From one base currency (USD), we derive:
- **Direct edges**: USD → EUR, USD → VND, etc. (~40)
- **Reverse edges**: EUR → USD, VND → USD, etc. (~40)
- **Cross edges**: EUR → VND, GBP → JPY, etc. (~1520)

**Total**: ~1600 edges from 40 vertices, allowing complex multi-hop paths

## Project Structure

```
src/main/java/com/plozdev/smartfxapplication/
├── controller/           # REST API endpoints
├── service/
│   ├── AlgorithmServiceI.java
│   ├── GraphManagementI.java
│   ├── RateIngestionServiceI.java
│   └── impl/             # Service implementations
├── client/               # FastForex API client
├── model/                # Graph, Edge, SPFA result
├── dto/                  # Request/response objects
├── config/               # WebClient, Swagger, Scheduling
└── exception/            # Global exception handler
```

## Screenshots

### Screen 1: Normal Exchange

<img width="1919" height="928" alt="case 1" src="https://github.com/user-attachments/assets/fcf85e27-616e-4de2-b19a-9cc0a746d0b7" />

Shows the main exchange interface with:
- Currency swap panel (left) - Enter amount and select from/to currencies
- Optimal conversion route display (right) - Shows calculated path and result
- Recent activity log - History of successful exchanges
- Market pulse indicator - System status

Use case: User performs a normal exchange USD → EUR with optimal path calculation

### Screen 2: After Arbitrage Injection

<img width="1919" height="928" alt="case 2" src="https://github.com/user-attachments/assets/8fe97c7b-6b74-4f3a-9ee4-cb5ce0cb5008" />

Demonstrates the demo/inject endpoint being used:
- Same interface layout
- But now an arbitrage edge has been injected into the graph
- Recent activity shows injected edge information
- System ready to detect the cycle

Use case: Backend testing - call `/api/v1/demo/inject-arbitrage?from=JPY&to=USD&rate=0.0082`

### Screen 3: Arbitrage Detected on Exchange

<img width="1919" height="928" alt="case 3" src="https://github.com/user-attachments/assets/92b922fd-96b5-4641-adfc-22c6ab2744e8" />

Shows what happens when user tries to exchange after injection:
- Exchange request triggers arbitrage detection
- Optimal conversion route displays the **profitable cycle** instead of normal path
- Example: USD → EUR → JPY → USD (14% profit detected)
- Alert/highlight on arbitrage cycle
- Recent activity logs the arbitrage opportunity

Use case: System detects: "Arbitrage found! Cycle: USD → EUR → JPY → USD"

## Configuration

Edit `src/main/resources/application.yaml`:
- `fastforex.transaction-fee` - Transaction fee per hop (default: 0.003)
- Rate update frequency - See `RateIngestionService` `@Scheduled` annotation

## Development

### Frontend Integration

```javascript
// Find exchange path
const response = await fetch('/api/v1/exchange?from=USD&to=VND&amount=1000');
const result = await response.json();

// Handle arbitrage
if (response.status === 400 && result.details?.arbitrageCycle) {
  console.log('Profit opportunity:', result.details.arbitrageCycle);
}

// Get currencies for dropdown
const currencies = await fetch('/api/v1/currencies').then(r => r.json());
```

### Testing

```bash
# Get all currencies
curl http://localhost:8080/api/v1/currencies

# Test exchange
curl "http://localhost:8080/api/v1/exchange?from=USD&to=EUR&amount=100"

# Swagger UI
open http://localhost:8080/swagger-ui.html
```
## ☁️ Deployment (Google Cloud Platform)

This project is configured to deploy to **Google Cloud Run** via **Cloud Build**.

### 1. Cấu hình CI/CD tự động
File `cloudbuild.yaml` is configured to:
- Automatically build Docker image.
- Tag image with both `:latest` and `:$SHORT_SHA`.
- Push to Artifact Registry (`smartfx-repo`).
- Automatically deploy/update to Cloud Run service `smartfx`.

### 2. Deploy thủ công bằng Script
If you want to deploy quickly from your personal computer (requires Google Cloud SDK):
```bash
./deploy.bat <YOUR_PROJECT_ID>

## Next Steps

### For Frontend Developers
1. Test all endpoints with cURL/Postman
2. Implement currency dropdown with `/api/v1/currencies`
3. Build exchange calculator UI
4. Handle arbitrage response - display `arbitrageCycle` to users
5. Handle error cases (400, 404)
6. Add loading indicators (100-300ms API response time)

### For Backend Developers
1. Review SPFA algorithm in [AlgorithmService.java](src/main/java/com/plozdev/smartfxapplication/service/impl/AlgorithmService.java)
2. Test demo workflow locally
3. Monitor logs for arbitrage detection
4. Adjust `MAJOR_CURRENCIES` set as needed

### For Production
1. Get paid FastForex API plan (more requests)
2. Add rate limiting to API endpoints
3. Add authentication/authorization
4. Setup database for rate history
5. Add monitoring & alerting for arbitrage detection
6. Secure or remove `/demo/*` endpoints
7. Add circuit breaker for API failures 




