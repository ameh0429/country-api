# Country Data API

A RESTful API that fetches country data from external APIs, stores it in a MySQL database, and provides CRUD operations with caching support.

## Features

- Fetch country data from REST Countries API
- Fetch exchange rates from Open Exchange Rates API
- Calculate estimated GDP for each country
- Cache data in MySQL database
- Filter and sort countries by region, currency, and GDP
- Generate summary images with top countries
- Full CRUD operations
- Comprehensive error handling

## Installation

### **Clone the repository**
```bash
git clone https://github.com/ameh0429/country-api.git
cd country-api
```

### **Install dependencies**
```bash
npm install axios canvas dotenv express mysql2
```

### **Set up environment variables**
Create a `.env` file in the root directory:
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=countries_db
DB_PORT=3306
```

### **Create the MySQL database**
```sql
CREATE DATABASE countries_db;
```

### **Start the server**
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

The server will automatically create the necessary tables on startup.

## API Endpoints

### 1. Refresh Country Data
Fetch fresh data from external APIs and update the database.

**Request:**
```http
POST /api/countries/refresh
```

**Response:**
```json
{
  "message": "Countries data refreshed successfully",
  "total_countries": 250,
  "last_refreshed_at": "2025-10-22T18:00:00.000Z"
}
```

### 2. Get All Countries
Retrieve all countries with optional filters.

**Request:**
```http
GET /api/countries
GET /api/countries?region=Africa
GET /api/countries?currency=NGN
GET /api/countries?sort=gdp_desc
```

**Query Parameters:**
- `region` - Filter by region (e.g., Africa, Europe, Asia)
- `currency` - Filter by currency code (e.g., NGN, USD, EUR)
- `sort` - Sort results:
  - `gdp_desc` - Sort by GDP descending
  - `gdp_asc` - Sort by GDP ascending
  - `population_desc` - Sort by population descending
  - `population_asc` - Sort by population ascending

**Response:**
```json
[
  {
    "id": 1,
    "name": "Nigeria",
    "capital": "Abuja",
    "region": "Africa",
    "population": 206139589,
    "currency_code": "NGN",
    "exchange_rate": 1600.23,
    "estimated_gdp": 25767448125.2,
    "flag_url": "https://flagcdn.com/ng.svg",
    "last_refreshed_at": "2025-10-22T18:00:00Z"
  }
]
```

### 3. Get Single Country
Retrieve a specific country by name.

**Request:**
```http
GET /api/countries/Nigeria
```

**Response:**
```json
{
  "id": 1,
  "name": "Nigeria",
  "capital": "Abuja",
  "region": "Africa",
  "population": 206139589,
  "currency_code": "NGN",
  "exchange_rate": 1600.23,
  "estimated_gdp": 25767448125.2,
  "flag_url": "https://flagcdn.com/ng.svg",
  "last_refreshed_at": "2025-10-22T18:00:00Z"
}
```

### 4. Delete Country
Delete a country record from the database.

**Request:**
```http
DELETE /api/countries/Nigeria
```

**Response:**
```json
{
  "message": "Country deleted successfully"
}
```

### 5. Get Status
Get API statistics and last refresh timestamp.

**Request:**
```http
GET /api/status
```

**Response:**
```json
{
  "total_countries": 250,
  "last_refreshed_at": "2025-10-22T18:00:00.000Z"
}
```

### 6. Get Summary Image
Retrieve the generated summary image showing top countries by GDP.

**Request:**
```http
GET /api/countries/image
```

**Response:** PNG image file

## Error Responses

### 404 Not Found
```json
{
  "error": "Country not found"
}
```

### 400 Bad Request
```json
{
  "error": "Validation failed",
  "details": {
    "currency_code": "is required"
  }
}
```

### 503 Service Unavailable
```json
{
  "error": "External data source unavailable",
  "details": "Could not fetch data from REST Countries API"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## Data Schema

### Country Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | INT | Auto | Primary key |
| name | VARCHAR(255) | Yes | Country name |
| capital | VARCHAR(255) | No | Capital city |
| region | VARCHAR(100) | No | Geographic region |
| population | BIGINT | Yes | Population count |
| currency_code | VARCHAR(10) | Yes* | Currency code (e.g., NGN) |
| exchange_rate | DECIMAL(20,6) | No | Exchange rate to USD |
| estimated_gdp | DECIMAL(30,2) | No | Calculated GDP estimate |
| flag_url | TEXT | No | URL to country flag |
| last_refreshed_at | TIMESTAMP | Auto | Last update timestamp |

*Note: `currency_code` can be null if country has no currency data

### GDP Calculation

```
estimated_gdp = (population × random(1000-2000)) ÷ exchange_rate
```

A new random multiplier is generated on each refresh for each country.

## Project Structure

```
country-api/
├── src/
│   ├── config/
│   │   └── database.js          # Database connection and initialization
│   ├── controllers/
│   │   └── countryController.js # Request handlers
│   ├── models/
│   │   └── countryModel.js      # Database queries
│   ├── routes/
│   │   └── countryRoutes.js     # API routes
│   ├── services/
│   │   ├── externalApiService.js # External API calls
│   │   └── imageService.js      # Image generation
│   ├── middleware/
│   │   ├── validation.js        # Input validation
│   │   └── errorHandler.js      # Error handling
│   └── server.js                # Main application entry
├── cache/
│   └── summary.png              # Generated summary image
├── .env                         # Environment variables
├── .env.example                 # Environment template
├── package.json                 # Dependencies
└── README.md                    # Documentation
```

## External APIs Used

1. **REST Countries API**
   - URL: `https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies`
   - Purpose: Fetch country information

2. **Open Exchange Rates API**
   - URL: `https://open.er-api.com/v6/latest/USD`
   - Purpose: Fetch currency exchange rates

## Currency Handling Logic

### Multiple Currencies
If a country has multiple currencies, only the **first currency code** from the array is stored.

### No Currencies
If a country has no currencies:
- `currency_code`: `null`
- `exchange_rate`: `null`
- `estimated_gdp`: `0`
- Country is still stored in database

### Currency Not Found in Exchange API
If the currency code is not found in exchange rates:
- `exchange_rate`: `null`
- `estimated_gdp`: `null`
- Country is still stored in database

### Environment Variables

All configuration is done via `.env` file:
- `PORT`: Server port (default: 3000)
- `DB_HOST`: country-service-amehmathiasejeh.f.aivencloud.com
- `DB_USER`: MySQL username
- `DB_PASSWORD`: MySQL password
- `DB_NAME`: defaultdb
- `DB_PORT`: 10648

## Error Handling

The API includes comprehensive error handling:
- **External API failures**: Returns 503 with details
- **Database errors**: Returns 500
- **Validation errors**: Returns 400 with field details
- **Not found errors**: Returns 404
- All errors return JSON responses

## Performance Considerations

- **Database indexing**: Indexes on `name`, `region`, and `currency_code`
- **Connection pooling**: MySQL connection pool with 10 connections
- **Caching**: All country data is cached in database
- **Timeout handling**: 10-second timeout on external API calls

## Support

For issues or questions, please open an issue in the repository.