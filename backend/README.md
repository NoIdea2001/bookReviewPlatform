# Book Review Platform – Backend

## Overview

This Express + MongoDB service powers the Book Review Platform. It provides authenticated APIs for managing users, books, and reviews, complete with pagination, search, sorting, and aggregated rating data.

## Tech Stack

- Node.js 18+
- Express 4
- MongoDB with Mongoose 8
- JSON Web Tokens (JWT) for auth
- bcryptjs for password hashing

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Create environment file**
   ```bash
   cp .env.example .env
   ```
   Fill in the MongoDB connection string and JWT secret. Never commit secrets to version control.
3. **Run in development mode**
   ```bash
   npm run dev
   ```
4. **Production build**
   ```bash
   npm start
   ```

The server listens on `PORT` (defaults to `5000`) and exposes all routes under `/api`.

### Seed mock data

Populate the database with demo users, books, and reviews:

```bash
npm run seed
```

> This command **deletes all existing users, books, and reviews** before inserting fresh mock content. Make sure your `MONGODB_URI` points to a development database.

Seeded accounts (all passwords are `password123`):

- `ava@example.com`
- `liam@example.com`
- `sofia@example.com`

Use these accounts to explore the API or log in from the frontend.

## Environment Variables

| Name          | Description                              |
| ------------- | ---------------------------------------- |
| `MONGODB_URI` | MongoDB connection string                |
| `JWT_SECRET`  | Secret used to sign JWT access tokens    |
| `JWT_EXPIRE`  | Token lifetime (e.g. `1d`, `7d`)         |
| `PORT`        | HTTP port (optional, defaults to `5000`) |

## Authentication

- `POST /api/auth/signup` – Create an account. Body: `{ name, email, password }`
- `POST /api/auth/login` – Log in with email/password. Returns `{ token, user }`

Include the JWT in the `Authorization: Bearer <token>` header (or `token` cookie) for all protected endpoints.

## Book APIs

- `GET /api/books`
  - Query params: `page`, `limit` (max 20), `search` (title/author), `genre`, `sortBy` (`createdAt`, `title`, `year`, `rating`), `order` (`asc`/`desc`)
  - Returns `{ data: Book[], meta: { total, page, limit, totalPages, hasNextPage, hasPrevPage } }`
- `GET /api/books/:id`
  - Returns a book with aggregated `averageRating`, `reviewCount`, `ratingDistribution`, and `reviews`
- `POST /api/books` _(auth required)_ – Create a book the current user owns
- `PUT /api/books/:id` _(auth required)_ – Update owned book fields (`title`, `author`, `description`, `genre`, `year`)
- `DELETE /api/books/:id` _(auth required)_ – Remove a book and its reviews

## Review APIs

- `GET /api/reviews/:bookId` – List reviews with `{ averageRating, reviewCount, ratingDistribution, reviews }`
- `POST /api/reviews/:bookId` _(auth required)_ – One review per user/book, rating 1–5
- `PUT /api/reviews/:bookId/:reviewId` _(auth required)_ – Edit your review
- `DELETE /api/reviews/:bookId/:reviewId` _(auth required)_ – Delete your review

## User APIs

- `GET /api/users/me` _(auth required)_ – Returns the authenticated user's profile, including books they have added (with rating stats) and their submitted reviews.

## Error Handling

Errors surface as JSON responses:

```json
{
  "success": false,
  "message": "Descriptive error message"
}
```

During development the stack trace is included to aid debugging.

## Deploying to Vercel

This project ships with a serverless entry point in `api/index.js` and a `vercel.json` configuration so it can be deployed directly to Vercel's Node.js 18 runtime.

1. **Install the Vercel CLI** (one time)
   ```bash
   npm install -g vercel
   ```
2. **Log in and link the project**
   ```bash
   vercel login
   vercel link
   ```
3. **Configure environment variables**
   ```bash
   vercel env add MONGODB_URI
   vercel env add JWT_SECRET
   vercel env add JWT_EXPIRE
   ```
   Use the same values you would place in `.env`. Repeat the command for each Vercel environment (development, preview, production) as needed.
4. **Deploy**
   ```bash
   vercel deploy --prod
   ```

Vercel will expose your API under `https://<your-backend>.vercel.app/api/...`. Reuse the generated URL when configuring the frontend (see `frontend/README.md`). MongoDB Atlas should allow outbound connections from Vercel; if you use IP allowlists, add the [Vercel egress ranges](https://vercel.com/docs/infrastructure/ips).

## Next Steps

- Build the React frontend and connect to these APIs
- Add integration tests (e.g. using Jest + Supertest)
- Explore hosting options beyond Vercel (Render, Railway, Fly.io) if you need persistent workers
- Explore the included Postman collection at `../book-review-platform.postman_collection.json` for quick endpoint testing.
