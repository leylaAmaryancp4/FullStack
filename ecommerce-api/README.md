# E-commerce API

REST API built with Node.js, Express, PostgreSQL, Prisma, and session-based authentication.

## Requirements

- Node.js 18 or later
- PostgreSQL
- npm

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env` in the project root:

   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/ecommerce"
   SESSION_SECRET="replace-with-a-long-random-secret"
   PORT=5000
   ```

3. Apply database migrations:

   ```bash
   npx prisma migrate dev
   ```

4. Start the API:

   ```bash
   npm run dev
   ```

Use `npm start` for a normal server start. The default base URL is `http://localhost:5000`.

Authentication uses an HTTP-only session cookie. API clients must preserve cookies between login and authenticated requests. New users receive the `customer` role. Admin-only routes require an authenticated user whose role is `admin`.

## Endpoints

### Authentication

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Public | Register. Body: `{ "email", "password" }` |
| POST | `/api/auth/login` | Public | Login. Body: `{ "email", "password" }` |
| GET | `/api/auth/me` | Auth | Get the current user |
| PATCH | `/api/auth/users/:id/role` | Admin | Update role. Body: `{ "role": "customer" }` |

### Products and categories

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/api/products` | Public | List products; optional `?category=Electronics` |
| GET | `/api/products/:id` | Public | Get a product with categories and reviews |
| POST | `/api/products` | Admin | Create a product |
| PUT | `/api/products/:id` | Admin | Update a product |
| DELETE | `/api/products/:id` | Admin | Delete a product |
| GET | `/api/categories` | Public | List categories |
| GET | `/api/categories/:id` | Public | Get a category |
| POST | `/api/categories` | Admin | Create a category |
| PUT | `/api/categories/:id` | Admin | Update a category |
| DELETE | `/api/categories/:id` | Admin | Delete a category |

### Cart

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/api/cart` | Auth | Get the current user's cart |
| POST | `/api/cart/items` | Auth | Add item. Body includes `productId` and `quantity` |
| PUT | `/api/cart/items/:productId` | Auth | Update item quantity |
| DELETE | `/api/cart/items/:productId` | Auth | Remove an item |

### Orders

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/api/orders/checkout` | Auth | Create an order from the cart |
| GET | `/api/orders` | Auth | Customers see their orders; admins see all |
| GET | `/api/orders/:id` | Auth | Get an authorized order |
| PATCH | `/api/orders/:id/status` | Admin | Update status: `pending`, `paid`, `shipped`, `delivered`, or `cancelled` |

### Reviews

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/api/products/:id/reviews` | Public | List product reviews |
| POST | `/api/products/:id/reviews` | Auth | Body: `{ "rating": 1-5, "comment": "..." }` |
| DELETE | `/api/reviews/:id` | Auth | Delete your own review or any review as an admin |

A user can review a product only after having a delivered order containing it. The database allows only one review per user and product.

## HTTP status codes

| Status | Meaning |
| --- | --- |
| 200 | Successful request |
| 201 | Resource created |
| 400 | Invalid request, validation error, or malformed JSON |
| 401 | Authentication required or invalid credentials |
| 403 | Authenticated but not authorized |
| 404 | Resource or route not found |
| 409 | Conflict, such as duplicate email or review |
| 500 | Unexpected server error |

All API errors are JSON objects with an `error` field:

```json
{
  "error": "You have already reviewed this product"
}
```

## Security

- Database access uses Prisma ORM methods; no raw SQL or string-concatenated queries are used.
- IDs and request values are validated before database operations.
- Authentication uses HTTP-only session cookies.
- Admin operations are protected by authorization middleware.
- `DATABASE_URL` and `SESSION_SECRET` are stored in environment variables.

## Commands

```bash
npm run dev       # Start with nodemon
npm start         # Start the server
npm run migrate   # Run Prisma migrations
```
