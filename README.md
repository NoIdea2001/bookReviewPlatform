# Book Review Platform

Full-stack MERN application where readers can discover books, share reviews, and keep track of their contributions.

## Features

- 🔐 **Authentication** – Sign up, log in, and persist JWT sessions securely.
- 📚 **Book management** – Add, edit, delete books (creator only) with pagination, search, filter, and sorting controls.
- ⭐ **Review system** – One review per user with live average rating updates and a rating distribution chart.
- 🌓 **Dark/light mode** – Theme toggle persisted across sessions.
- 👤 **Profile dashboard** – See books you've added and the reviews you've written.
- 📈 **Analytics** – Recharts bar chart visualising rating distribution on the book details page.
- 📬 **Postman collection** – Ready-made requests in `book-review-platform.postman_collection.json`.

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, React Router, Zustand, React Hook Form, Recharts
- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT, bcrypt

## Prerequisites

- Node.js 18+
- npm 9+
- MongoDB Atlas connection string (or local MongoDB instance)

## Getting Started

1. **Clone and install dependencies**
   ```bash
   git clone <repo-url>
   cd bookReviewPlatform
   npm install --prefix backend
   npm install --prefix frontend
   ```
2. **Configure environment**

   - Copy `backend/.env.example` (create one if missing) to `backend/.env`
   - Set `MONGODB_URI` and `JWT_SECRET`

3. **Run the backend**

   ```bash
   cd backend
   npm run dev
   ```

4. **Run the frontend**
   ```bash
   cd frontend
   npm run dev
   ```

The frontend expects the API to be available at `/api`. When running both servers locally, proxy API requests through Vite or serve the frontend with the backend in production.

## Additional Resources

- **Seed data:** `npm run seed` (backend) clears and repopulates demo users/books/reviews.
- **API docs:** See `backend/README.md` and the Postman collection for endpoints and request samples.
- **Deployment tips:**
  - **Backend on Vercel:** The repo includes `backend/api/index.js` and `backend/vercel.json` so you can deploy the API as a serverless function. Link the project with the Vercel CLI, add `MONGODB_URI`, `JWT_SECRET`, and `JWT_EXPIRE` via `vercel env`, then run `vercel deploy --prod`.
  - **Frontend on Vercel/Netlify:** Build with `npm run build` inside `frontend`. Supply `VITE_API_URL` (e.g. `https://<your-backend>.vercel.app/api`) so the client calls the deployed backend.

## Testing Checklist

- ✅ Sign-up and login flows
- ✅ Add, edit, delete books (owner-only)
- ✅ List books with pagination/search/filter/sorting
- ✅ Add, edit, delete reviews with live stats
- ✅ Profile dashboard shows user contributions
- ✅ Rating distribution chart renders on book details page
- ✅ Dark/light theme toggle persists

Have fun exploring and extending the platform! 🎉
