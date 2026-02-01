# Library Management System API

A RESTful API for managing books, borrowers, and borrowing processes in a library.

## Features

- **Books Management**: Add, update, delete, list, and search books
- **Borrowers Management**: Register, update, delete, and list borrowers
- **Borrowing Process**: Check out books, return books, track due dates, and manage overdue items
- **Analytics & Reports**: Export borrowing data in CSV/XLSX formats
- **Rate Limiting**: Protection against API abuse on critical endpoints
- **Authentication**: Basic API key authentication
- **Docker Support**: Containerized application with Docker Compose

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with pg-promise
- **Validation**: Zod
- **Security**: Helmet, CORS, Rate Limiting
- **Testing**: Jest
- **Export**: CSV and XLSX file generation

## Prerequisites

- Node.js 20.x or higher
- PostgreSQL 16.x or higher
- Docker & Docker Compose (optional)

## Quick Start

### Using Docker (Recommended)

```bash
# Start the application
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

The API will be available at `http://localhost:3000`

### Local Setup (Without Docker)

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your PostgreSQL credentials

# Create database and run migrations
psql -U postgres -c "CREATE DATABASE library_db;"
psql -U postgres -d library_db -f src/db/schema.sql
psql -U postgres -d library_db -f src/db/seeds.sql

# Start development server
npm run dev
```

The API will be available at `http://localhost:3000`

## API Endpoints

### Authentication

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| POST | `/api/auth/register` | Register a new user | No |
| POST | `/api/auth/login` | Login and get JWT token | No |
| GET | `/api/auth/profile` | Get current user profile | Required |

### Books

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| POST | `/api/books` | Create a new book | Optional |
| GET | `/api/books` | List all books (paginated) | No |
| GET | `/api/books/:id` | Get book by ID | No |
| GET | `/api/books/search?q=query&field=title` | Search books | No |
| PUT | `/api/books/:id` | Update book details | Optional |
| DELETE | `/api/books/:id` | Delete a book | Optional |

**Rate Limiting**: POST endpoint is rate-limited to 20 requests per 15 minutes

### Borrowers

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| POST | `/api/borrowers` | Register a new borrower | Optional |
| GET | `/api/borrowers` | List all borrowers (paginated) | No |
| GET | `/api/borrowers/:id` | Get borrower by ID | No |
| PUT | `/api/borrowers/:id` | Update borrower details | Optional |
| DELETE | `/api/borrowers/:id` | Delete a borrower | Optional |

### Borrowings

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| POST | `/api/borrowings/checkout` | Check out a book | Optional |
| POST | `/api/borrowings/:id/return` | Return a book | Optional |
| GET | `/api/borrowings/borrower/:borrower_id` | Get borrower's current books | No |
| GET | `/api/borrowings/overdue` | List overdue books | No |
| GET | `/api/borrowings?status=borrowed` | List all borrowings (with optional status filter) | No |

**Rate Limiting**: Checkout endpoint is rate-limited to 10 requests per 15 minutes

### Reports & Analytics

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| GET | `/api/reports/overdue/last-month` | Get overdue borrowings from last month | No |
| GET | `/api/reports/all/last-month` | Get all borrowings from last month | No |
| GET | `/api/reports/export/overdue/last-month?format=csv` | Export overdue borrowings (CSV/XLSX) | No |
| GET | `/api/reports/export/all/last-month?format=xlsx` | Export all borrowings (CSV/XLSX) | No |
| GET | `/api/reports/export/period?start_date=2024-01-01&end_date=2024-01-31&format=csv` | Export by date range | No |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Check API health |

## Request/Response Examples

### Create a Book

**Request:**
```bash
POST /api/books
Content-Type: application/json

{
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "isbn": "9780743273565",
  "total_quantity": 5,
  "shelf_location": "A1"
}
```

**Response:**
```json
{
  "id": 1,
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "isbn": "9780743273565",
  "total_quantity": 5,
  "available_quantity": 5,
  "shelf_location": "A1",
  "created_at": "2024-01-31T12:00:00.000Z",
  "updated_at": "2024-01-31T12:00:00.000Z"
}
```

### Register a Borrower

**Request:**
```bash
POST /api/borrowers
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john.doe@example.com"
}
```

**Response:**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john.doe@example.com",
  "registered_date": "2024-01-31",
  "created_at": "2024-01-31T12:00:00.000Z",
  "updated_at": "2024-01-31T12:00:00.000Z"
}
```

### Checkout a Book

**Request:**
```bash
POST /api/borrowings/checkout
Content-Type: application/json

{
  "book_id": 1,
  "borrower_id": 1
}
```

**Response:**
```json
{
  "id": 1,
  "book_id": 1,
  "borrower_id": 1,
  "borrowed_date": "2024-01-31",
  "due_date": "2024-02-14",
  "return_date": null,
  "status": "borrowed",
  "created_at": "2024-01-31T12:00:00.000Z",
  "updated_at": "2024-01-31T12:00:00.000Z"
}
```

### Return a Book

**Request:**
```bash
POST /api/borrowings/1/return
```

**Response:**
```json
{
  "id": 1,
  "book_id": 1,
  "borrower_id": 1,
  "borrowed_date": "2024-01-31",
  "due_date": "2024-02-14",
  "return_date": "2024-02-05",
  "status": "returned",
  "created_at": "2024-01-31T12:00:00.000Z",
  "updated_at": "2024-02-05T12:00:00.000Z"
}
```

## Authentication

The API uses **JWT (JSON Web Tokens)** for authentication.

### Getting Started

**1. Register a new user:**
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your-password",
  "name": "Your Name"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "Your Name"
  }
}
```

**2. Login:**
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your-password"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "Your Name"
  }
}
```

### Using JWT Tokens

For protected endpoints, include the token in the `Authorization` header:

```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Example:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/auth/profile
```

### Default Test Users

The seeded database includes two test users (password: `password123`):
- `admin@library.com`
- `user@library.com`

## Error Handling

The API returns consistent error responses:

```json
{
  "status": "error",
  "message": "Book not found"
}
```

### HTTP Status Codes

- `200 OK`: Successful GET, PUT requests
- `201 Created`: Successful POST request
- `400 Bad Request`: Validation error
- `401 Unauthorized`: Authentication failed
- `404 Not Found`: Resource not found
- `409 Conflict`: Duplicate resource or constraint violation
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

## Testing

Run the test suite:

```bash
npm test
```

Run tests in watch mode:

```bash
npm test:watch
```

The project includes unit tests for the Books service module.

## Development

### Available Scripts

- `npm run dev`: Start development server with hot reload
- `npm run build`: Build TypeScript to JavaScript
- `npm start`: Start production server
- `npm test`: Run tests
- `npm run lint`: Run ESLint
- `npm run format`: Format code with Prettier
- `npm run db:migrate`: Run database migrations

## Database Schema

### Books Table
- `id`: Serial primary key
- `title`: VARCHAR(255)
- `author`: VARCHAR(255)
- `isbn`: VARCHAR(13) UNIQUE
- `total_quantity`: INTEGER
- `available_quantity`: INTEGER
- `shelf_location`: VARCHAR(50)
- `created_at`, `updated_at`: Timestamps

### Borrowers Table
- `id`: Serial primary key
- `name`: VARCHAR(255)
- `email`: VARCHAR(255) UNIQUE
- `registered_date`: DATE
- `created_at`, `updated_at`: Timestamps

### Borrowings Table
- `id`: Serial primary key
- `book_id`: Foreign key to books
- `borrower_id`: Foreign key to borrowers
- `borrowed_date`: DATE
- `due_date`: DATE
- `return_date`: DATE (nullable)
- `status`: ENUM ('borrowed', 'returned', 'overdue')
- `created_at`, `updated_at`: Timestamps

## Performance Optimizations

- Database indexes on frequently queried columns (title, author, ISBN, email, status, due_date)
- Connection pooling with pg-promise
- Pagination for large result sets
- Rate limiting on critical endpoints

## Security Features

- Helmet.js for security headers
- CORS enabled
- Input validation with Zod
- Parameterized queries (SQL injection prevention)
- Rate limiting on POST endpoints
- Optional API key authentication
