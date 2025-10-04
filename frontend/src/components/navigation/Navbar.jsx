import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../state/auth.store.js";
import ThemeToggle from "./ThemeToggle.jsx";

const navLinkClass = ({ isActive }) =>
  `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? "bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-200"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
  }`;

const Navbar = () => {
  const { isAuthenticated, user, clearCredentials } = useAuth();

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="flex items-center gap-2 text-lg font-semibold text-brand-600"
        >
          <span role="img" aria-label="books">
            📚
          </span>
          BookReview
        </Link>
        <nav className="flex items-center gap-4">
          <NavLink to="/" className={navLinkClass} end>
            Home
          </NavLink>
          {isAuthenticated && (
            <>
              <NavLink to="/books/new" className={navLinkClass}>
                Add Book
              </NavLink>
              <NavLink to="/profile" className={navLinkClass}>
                Profile
              </NavLink>
            </>
          )}
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="hidden text-sm font-medium text-slate-700 dark:text-slate-200 sm:inline-flex">
                Hey, {user?.name?.split(" ")[0] || "Reader"}
              </span>
              <button
                type="button"
                onClick={clearCredentials}
                className="rounded-md border border-transparent bg-brand-500 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
              >
                Log out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="rounded-md border border-brand-500 px-3 py-2 text-sm font-semibold text-brand-600 hover:bg-brand-50 dark:border-brand-400 dark:text-brand-300"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
