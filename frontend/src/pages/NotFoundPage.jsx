import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="mx-auto max-w-xl space-y-6 text-center">
      <div className="space-y-2">
        <p className="text-6xl">🧐</p>
        <h1 className="text-3xl font-heading font-semibold">Page not found</h1>
        <p className="text-sm text-slate-500 dark:text-slate-300">
          The page you’re looking for might have been removed or is temporarily
          unavailable.
        </p>
      </div>
      <Link
        to="/"
        className="inline-flex items-center justify-center rounded-md bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
      >
        Back to home
      </Link>
    </div>
  );
};

export default NotFoundPage;
