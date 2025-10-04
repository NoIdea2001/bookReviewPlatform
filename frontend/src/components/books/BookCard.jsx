import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { FiStar, FiUser } from "react-icons/fi";
import clsx from "clsx";

const BookCard = ({ book }) => {
  const averageRating = book.averageRating ?? null;
  const reviewCount = book.reviewCount ?? 0;

  return (
    <article className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <header className="space-y-2">
        <h3 className="text-xl font-heading font-semibold text-slate-900 dark:text-slate-100">
          <Link
            to={`/books/${book._id}`}
            className="hover:text-brand-600 dark:hover:text-brand-400"
          >
            {book.title}
          </Link>
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-300">
          {book.author || "Unknown author"}
        </p>
        {book.genre && (
          <span className="inline-flex rounded-full bg-brand-100 px-3 py-1 text-xs font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
            {book.genre}
          </span>
        )}
      </header>

      <p className="mt-4 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        {book.description
          ? `${book.description.slice(0, 140)}${
              book.description.length > 140 ? "…" : ""
            }`
          : "No description provided."}
      </p>

      <footer className="mt-6 flex items-center justify-between text-sm text-slate-500 dark:text-slate-300">
        <div className="flex items-center gap-2">
          <FiStar
            className={clsx(
              "h-5 w-5",
              averageRating ? "text-amber-500" : "text-slate-400"
            )}
          />
          <span className="font-medium">
            {averageRating ? Number(averageRating).toFixed(1) : "N/A"}
          </span>
          <span className="text-xs text-slate-400">
            ({reviewCount} reviews)
          </span>
        </div>
        {book.addedBy?.name && (
          <div className="flex items-center gap-1 text-xs">
            <FiUser className="h-4 w-4" />
            <span>{book.addedBy.name}</span>
          </div>
        )}
      </footer>
    </article>
  );
};

BookCard.propTypes = {
  book: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    author: PropTypes.string,
    description: PropTypes.string,
    genre: PropTypes.string,
    averageRating: PropTypes.number,
    reviewCount: PropTypes.number,
    addedBy: PropTypes.shape({
      name: PropTypes.string,
    }),
  }).isRequired,
};

export default BookCard;
