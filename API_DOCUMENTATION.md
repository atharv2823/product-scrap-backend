# API Documentation — E-Commerce Visual Search, Scraping & RAG Chatbot

**Base URL**: `http://localhost:3000`  
**Protocol**: HTTP / JSON / Multipart Form Data  
**Auth Scheme**: `Bearer <JWT_TOKEN>` for protected routes  

---

## Quick Navigation

- [1. Visual Search & Multi-Platform Scraping (`/product-search`)](#1-visual-search--multi-platform-scraping-product-search)
  - [`POST /product-search/upload-image`](#post-product-searchupload-image)
  - [`POST /product-search/text`](#post-product-searchtext)
- [2. Conversational RAG Shopping Assistant (`/chat`)](#2-conversational-rag-shopping-assistant-chat)
  - [`POST /chat`](#post-chat)
- [3. Product Catalog & Vector Search (`/product`)](#3-product-catalog--vector-search-product)
  - [`GET /product`](#get-product)
  - [`GET /product/search`](#get-productsearch)
  - [`GET /product/:id`](#get-productid)
  - [`DELETE /product/:id`](#delete-productid)
- [4. Authentication (`/auth`)](#4-authentication-auth)
  - [`POST /auth/register`](#post-authregister)
  - [`POST /auth/login`](#post-authlogin)
- [5. User Management (`/user`)](#5-user-management-user)
  - [`GET /user/profile`](#get-userprofile-protected)
  - [`GET /user`](#get-user)
  - [`GET /user/:id`](#get-userid)
  - [`GET /user/email/:email`](#get-useremailemail)
  - [`POST /user`](#post-user)

---

## 1. Visual Search & Multi-Platform Scraping (`/product-search`)

### `POST /product-search/upload-image`
Uploads a product image. In the background:
1. **Gemini Vision AI (`gemini-3.6-flash`)** inspects the image buffer and determines product model, brand, category, color, and creates an optimized search keyword query.
2. **Concurrent Web Scraper** fetches live product listings from **Amazon India, Flipkart, and Ajio**.
3. **LangChain Extractor** parses prices, original MRP, star ratings, and links into structured JSON.
4. **Embedding Service** batches 3072-dim embeddings into **Supabase `pgvector`**.
5. Returns intelligent user feedback along with scraped comparisons.

- **Content-Type**: `multipart/form-data`
- **File Limits**: Max 10 MB. Supported formats: `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`.

#### Request Form Data
| Key | Type | Description |
|---|---|---|
| `file` | File (Binary) | Image of the product to search |

#### Sample Curl Command
```bash
curl --location 'http://localhost:3000/product-search/upload-image' \
--form 'file=@"/C:/Users/Hp/Downloads/sneakers.jpg.webp"'
```

#### Success Response (`201 Created`)
```json
{
  "success": true,
  "userFeedback": "We identified a pair of Puma Smash v2 Low Top Leather Sneakers in White & Black. Searching Amazon, Flipkart, and Ajio for the best prices...",
  "analysis": {
    "productName": "Puma Smash v2 Leather Sneakers",
    "brand": "Puma",
    "category": "Footwear / Sneakers",
    "color": "White / Black",
    "searchQuery": "Puma Smash v2 white sneakers"
  },
  "totalFound": 9,
  "products": [
    {
      "id": "e6a4b123-789a-4cde-b567-123456789abc",
      "platform": "flipkart",
      "title": "PUMA Smash v2 Leather Casual Shoes For Men",
      "price": "2499.00",
      "originalPrice": "4499.00",
      "rating": "4.30",
      "productUrl": "https://www.flipkart.com/puma-smash-v2-leather-casuals/p/...",
      "imageUrl": "https://rukminim2.flixcart.com/image/...",
      "createdAt": "2026-09-04T12:30:00.000Z"
    },
    {
      "id": "f8c2d345-123b-4ef0-a123-987654321def",
      "platform": "amazon",
      "title": "Puma Mens Smash v2 Sneaker",
      "price": "2699.00",
      "originalPrice": "4499.00",
      "rating": "4.20",
      "productUrl": "https://www.amazon.in/dp/...",
      "imageUrl": "https://m.media-amazon.com/images/...",
      "createdAt": "2026-09-04T12:30:00.000Z"
    },
    {
      "id": "a1b2c3d4-567e-890f-g123-456789abcdef",
      "platform": "ajio",
      "title": "Puma Men Low-Top Smash v2 Sneakers",
      "price": "2599.00",
      "originalPrice": "4499.00",
      "rating": "4.40",
      "productUrl": "https://www.ajio.com/puma-smash-v2-sneakers/p/...",
      "imageUrl": "https://assets.ajio.com/medias/...",
      "createdAt": "2026-09-04T12:30:00.000Z"
    }
  ]
}
```

---

### `POST /product-search/text`
Direct text search across Amazon, Flipkart, and Ajio without uploading an image. Scrapes listings, embeds them, and saves to `pgvector`.

- **Content-Type**: `application/json`

#### Request Body
```json
{
  "query": "Sony WH-1000XM5 Wireless Headphones"
}
```

#### Sample Curl Command
```bash
curl --location 'http://localhost:3000/product-search/text' \
--header 'Content-Type: application/json' \
--data '{
  "query": "Sony WH-1000XM5 Wireless Headphones"
}'
```

#### Success Response (`201 Created`)
```json
{
  "success": true,
  "query": "Sony WH-1000XM5 Wireless Headphones",
  "totalFound": 8,
  "products": [
    {
      "id": "3b7b25a1-42cb-4567-8910-111213141516",
      "platform": "amazon",
      "title": "Sony WH-1000XM5 Wireless Industry Leading Noise Canceling Headphones",
      "price": "29990.00",
      "originalPrice": "34990.00",
      "rating": "4.60",
      "productUrl": "https://www.amazon.in/...",
      "imageUrl": "https://m.media-amazon.com/..."
    }
  ]
}
```

---

## 2. Conversational RAG Shopping Assistant (`/chat`)

### `POST /chat`
Conversational RAG (Retrieval-Augmented Generation) shopping assistant:
1. Embeds the user question using `gemini-embedding-001`.
2. Performs vector cosine similarity (`<=>`) search against `scraped_products` in Supabase PostgreSQL.
3. Injects retrieved real-time prices, ratings, and URLs into a structured comparison prompt.
4. Generates a grounded markdown response comparing platforms and highlighting the cheapest deal.

- **Content-Type**: `application/json`

#### Request Body
```json
{
  "message": "Which platform has the best price for Puma Smash v2 and what are the links?"
}
```

#### Sample Curl Command
```bash
curl --location 'http://localhost:3000/chat' \
--header 'Content-Type: application/json' \
--data '{
  "message": "Which platform has the best price for Puma Smash v2 and what are the links?"
}'
```

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "answer": "Here is the price comparison for the **Puma Smash v2 Sneakers** across top platforms:\n\n| Platform | Price | Original Price | Rating | Buy Link |\n|---|---|---|---|---|\n| **Flipkart** | **₹2,499** | ₹4,499 | 4.3 ★ | [Buy on Flipkart](https://www.flipkart.com/...) |\n| **Ajio** | ₹2,599 | ₹4,499 | 4.4 ★ | [Buy on Ajio](https://www.ajio.com/...) |\n| **Amazon** | ₹2,699 | ₹4,499 | 4.2 ★ | [Buy on Amazon](https://www.amazon.in/...) |\n\n### Recommendation:\n**Flipkart** offers the lowest price at **₹2,499**, saving you an extra ₹200 compared to Amazon!"
}
```

---

## 3. Product Catalog & Vector Search (`/product`)

### `GET /product`
Retrieve previously scraped products stored in the database, ordered by latest date.

- **Query Parameters**:
  - `limit` *(optional, default: 20)*: Number of records to return.
  - `offset` *(optional, default: 0)*: Number of records to skip for pagination.

#### Sample Curl Command
```bash
curl --location 'http://localhost:3000/product?limit=10&offset=0'
```

#### Success Response (`200 OK`)
```json
[
  {
    "id": "e6a4b123-789a-4cde-b567-123456789abc",
    "platform": "flipkart",
    "title": "PUMA Smash v2 Leather Casual Shoes",
    "price": "2499.00",
    "originalPrice": "4499.00",
    "rating": "4.30",
    "productUrl": "https://www.flipkart.com/...",
    "imageUrl": "https://rukminim2.flixcart.com/...",
    "createdAt": "2026-09-04T12:30:00.000Z"
  }
]
```

---

### `GET /product/search`
Perform pure semantic vector search directly against the `pgvector` index.

- **Query Parameters**:
  - `q` *(required)*: The search query text (e.g. `running shoes under 3000`).
  - `limit` *(optional, default: 6)*: Maximum number of similar products to retrieve.

#### Sample Curl Command
```bash
curl --location 'http://localhost:3000/product/search?q=white+leather+sneakers&limit=4'
```

#### Success Response (`200 OK`)
```json
[
  {
    "id": "e6a4b123-789a-4cde-b567-123456789abc",
    "platform": "flipkart",
    "title": "PUMA Smash v2 Leather Casual Shoes",
    "price": "2499.00",
    "originalPrice": "4499.00",
    "rating": "4.30",
    "productUrl": "https://www.flipkart.com/...",
    "imageUrl": "https://rukminim2.flixcart.com/..."
  }
]
```

---

### `GET /product/:id`
Fetch a specific product's full data by UUID.

#### Sample Curl Command
```bash
curl --location 'http://localhost:3000/product/e6a4b123-789a-4cde-b567-123456789abc'
```

#### Success Response (`200 OK`)
```json
{
  "id": "e6a4b123-789a-4cde-b567-123456789abc",
  "platform": "flipkart",
  "title": "PUMA Smash v2 Leather Casual Shoes",
  "price": "2499.00",
  "originalPrice": "4499.00",
  "rating": "4.30",
  "productUrl": "https://www.flipkart.com/...",
  "imageUrl": "https://rukminim2.flixcart.com/...",
  "description": null,
  "createdAt": "2026-09-04T12:30:00.000Z"
}
```

---

### `DELETE /product/:id`
Delete a product record from the catalog.

#### Sample Curl Command
```bash
curl --location --request DELETE 'http://localhost:3000/product/e6a4b123-789a-4cde-b567-123456789abc'
```

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Product e6a4b123-789a-4cde-b567-123456789abc deleted successfully"
}
```

---

## 4. Authentication (`/auth`)

### `POST /auth/register`
Creates a new user account with hashed password (`bcrypt`).

- **Content-Type**: `application/json`

#### Request Body
```json
{
  "firstName": "Alex",
  "lastName": "Sharma",
  "age": 28,
  "email": "alex@example.com",
  "password": "Password@123"
}
```

#### Sample Curl Command
```bash
curl --location 'http://localhost:3000/auth/register' \
--header 'Content-Type: application/json' \
--data '{
  "firstName": "Alex",
  "lastName": "Sharma",
  "age": 28,
  "email": "alex@example.com",
  "password": "Password@123"
}'
```

#### Success Response (`201 Created`)
```json
{
  "id": 1,
  "firstName": "Alex",
  "lastName": "Sharma",
  "age": 28,
  "email": "alex@example.com"
}
```

---

### `POST /auth/login`
Authenticates a user and returns a signed JWT access token.

- **Content-Type**: `application/json`

#### Request Body
```json
{
  "email": "alex@example.com",
  "password": "Password@123"
}
```

#### Sample Curl Command
```bash
curl --location 'http://localhost:3000/auth/login' \
--header 'Content-Type: application/json' \
--data '{
  "email": "alex@example.com",
  "password": "Password@123"
}'
```

#### Success Response (`200 OK`)
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoiYWxleEBleGFtcGxlLmNvbSIsImlhdCI6MTc4ODUyMDAwMCwiZXhwIjoxNzg4NTI4MDAwfQ.xxxxxxxx"
}
```

---

## 5. User Management (`/user`)

### `GET /user/profile` *(Protected)*
Returns the currently authenticated user's profile based on the JWT Bearer token.

- **Headers**: `Authorization: Bearer <access_token>`

#### Sample Curl Command
```bash
curl --location 'http://localhost:3000/user/profile' \
--header 'Authorization: Bearer YOUR_ACCESS_TOKEN'
```

#### Success Response (`200 OK`)
```json
{
  "id": 1,
  "firstName": "Alex",
  "lastName": "Sharma",
  "age": 28,
  "email": "alex@example.com"
}
```

---

### `GET /user`
List all registered users.

#### Sample Curl Command
```bash
curl --location 'http://localhost:3000/user'
```

#### Success Response (`200 OK`)
```json
[
  {
    "id": 1,
    "firstName": "Alex",
    "lastName": "Sharma",
    "age": 28,
    "email": "alex@example.com"
  }
]
```

---

### `GET /user/:id`
Find a single user by numeric ID.

#### Sample Curl Command
```bash
curl --location 'http://localhost:3000/user/1'
```

#### Success Response (`200 OK`)
```json
{
  "id": 1,
  "firstName": "Alex",
  "lastName": "Sharma",
  "age": 28,
  "email": "alex@example.com"
}
```

---

### `GET /user/email/:email`
Find a user by email address.

#### Sample Curl Command
```bash
curl --location 'http://localhost:3000/user/email/alex@example.com'
```

#### Success Response (`200 OK`)
```json
{
  "id": 1,
  "firstName": "Alex",
  "lastName": "Sharma",
  "age": 28,
  "email": "alex@example.com"
}
```

---

## 6. Common Status Codes & Error Handling

| HTTP Status | Meaning | Typical Scenario |
|---|---|---|
| `200 OK` | Request succeeded | Successful GET or login |
| `201 Created` | Resource created | Successful registration or image upload |
| `400 Bad Request` | Invalid client payload | Uploading non-image file, missing query |
| `401 Unauthorized` | Authentication failure | Missing or expired JWT token on protected routes |
| `404 Not Found` | Resource missing | Product ID or User ID not found |
| `429 Too Many Requests` | API quota hit | Google Gemini free-tier rate limit (handled via automatic backoff retry) |
| `500 Internal Server Error` | Unhandled exception | Database connection timeout or network outage |
