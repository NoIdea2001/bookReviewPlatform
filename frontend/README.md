# Book Review Platform – Frontend

## Overview

This Vite + React application delivers the user experience for the Book Review Platform. It connects to the Express/MongoDB backend, letting readers browse community-curated titles, share reviews, and manage their personal library with a polished, responsive UI.

## Live Deployment

- Frontend (Vercel): https://book-review-platform-lyart.vercel.app/
- Backend API (Vercel): https://book-review-platform-backend-two.vercel.app/

## Highlights

- **Authentication-aware routing** using React Router, Zustand, and protected routes.
- **Book discovery tools** with live search, genre filtering, sorting, and server-side pagination (5 books per page).
- **Rich book details** view featuring aggregated review stats, rating distribution charts (Recharts), and owner controls.
- **Review composer** enabling users to add, edit, or delete their single review per book with inline feedback.
- **Book authoring flow** powered by React Hook Form and a shared Books context, handling create/edit/delete mutations.
- **Profile dashboard** summarizing a user’s contributed books and reviews.
- **Persistent theming** (light/dark) via a Theme context with localStorage sync.

## Tech Stack

- React 18 + Vite
- React Router v6
- Tailwind CSS + @tailwindcss/forms
- Zustand (state) & custom context providers
- Axios with interceptor-based auth handling
- React Hook Form for form state and validation
- Recharts for analytics visualisation

## Prerequisites

- Node.js **18+**
- npm **9+**
- Backend API running locally at `http://localhost:5000` (or a deployed instance)

## Installation

From the repo root:

```bash
cd frontend
npm install
```

## Available Scripts

| Command           | Description                                                                 |
| ----------------- | --------------------------------------------------------------------------- |
| `npm run dev`     | Start the Vite dev server on <http://localhost:5173> (opens automatically). |
| `npm run build`   | Create an optimized production build in `dist/`.                            |
| `npm run preview` | Preview the production build locally after running `npm run build`.         |

> The dev server proxies requests targeting `/api` to `http://localhost:5000` (defined in `vite.config.js`). Ensure the backend is running for authenticated flows.

## API & Environment Configuration

- API requests are made through `src/lib/apiClient.js`, which defaults to `baseURL: "/api"`. In production, set `VITE_API_URL` (e.g. `https://your-backend.vercel.app/api`) so the client points at the deployed API.
- Define environment variables in `.env` files (see `.env.example`) or through your hosting dashboard. Vite exposes variables prefixed with `VITE_` as `import.meta.env` at build time.
- To change the proxy target during local development, modify `server.proxy` inside `vite.config.js`.
- Authentication tokens persist in `localStorage` via the Zustand store (`book-review-auth` key).

## Project Structure

```
frontend/
├── src/
│   ├── components/       # UI components (navigation, book cards, etc.)
│   ├── hooks/            # Reusable hooks (e.g., debounced search)
│   ├── layouts/          # Shell layout with navbar/footer
│   ├── pages/            # Route views (Home, Book Details, Profile, Auth, etc.)
│   ├── providers/        # Theme & Books context providers
│   ├── services/         # API clients (auth, books, reviews, user profile)
│   ├── state/            # Zustand auth store
│   └── routes/           # App routing + protected route wrapper
├── index.html            # Vite entry point
├── tailwind.config.js    # Tailwind setup (brand colors, etc.)
└── vite.config.js        # Vite config with dev proxy
```

## Key Concepts

- **AppProviders** wraps Theme and Books providers to keep theme mode and API mutations globally accessible.
- **Zustand auth store** (`useAuth`) retains credentials across page reloads and injects the JWT into Axios requests.
- **BooksProvider** centralizes book mutations so the list UI can react to the latest changes (`lastMutationAt` trigger).
- **React Hook Form** drives the create/edit book forms and review composer with client-side validation feedback.
- **Tailwind CSS** ensures rapid styling with dark-mode theming and responsive layouts.

## Building & Deployment

1. Produce the static build:
   ```bash
   npm run build
   ```
2. Serve the generated `dist/` directory from your hosting provider (Vercel, Netlify, S3, etc.).
3. Configure the backend API URL:
   - If hosting under the same domain, keep the `/api` base path and proxy through your backend server.
   - Otherwise, set `VITE_API_URL` to your deployed backend (e.g. `https://<backend>.vercel.app/api`) before running the build.

### Deploying to Vercel

1. Install and authenticate the Vercel CLI (`npm install -g vercel`, then `vercel login`).
2. Link the project inside `frontend/` (`vercel link`).
3. Add environment variables:
   ```bash
   vercel env add VITE_API_URL https://<backend>.vercel.app/api
   ```
4. Deploy the static build:
   ```bash
   vercel deploy --prod
   ```

During preview deployments you can set different `VITE_API_URL` values (e.g. pointing to staging). Re-run `vercel env pull` locally if you want a matching `.env` file for tests.

## Troubleshooting

- **401 / auth redirects**: Ensure the backend is reachable and `JWT_SECRET` matches the server configuration. Tokens clear automatically when a 401 response is detected.
- **Proxy errors in dev**: Confirm the backend is running on port 5000 or adjust the Vite proxy target.
- **Chart not rendering**: Recharts requires numerical rating data; ensure the backend returns rating stats (see backend README for details).
- **Styling issues after edits**: Restart the dev server after modifying Tailwind config so classes regenerate.

## Further Enhancements

- Add unit/UI tests (e.g., Vitest + React Testing Library)
- Implement code splitting where appropriate to shrink the JS bundle
- Introduce environment-driven API configuration instead of hard-coded base URLs
- Integrate analytics or performance monitoring tools for production deployments

Happy hacking! 🎨📚
