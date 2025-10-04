import { useEffect, useState } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiSearch,
  FiSliders,
} from "react-icons/fi";
import { IoWarningOutline } from "react-icons/io5";
import BookCard from "../components/books/BookCard.jsx";
import { useDebounce } from "../hooks/useDebounce.js";
import { getBooks } from "../services/book.service.js";
import { useBooks } from "../providers/BooksProvider.jsx";

const sortOptions = [
  { label: "Recently added", sortBy: "createdAt", order: "desc" },
  { label: "Title A → Z", sortBy: "title", order: "asc" },
  { label: "Title Z → A", sortBy: "title", order: "desc" },
  { label: "Year (newest)", sortBy: "year", order: "desc" },
  { label: "Rating (highest)", sortBy: "rating", order: "desc" },
];

const HomePage = () => {
  const [books, setBooks] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 5;
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { lastMutationAt } = useBooks();

  const debouncedSearch = useDebounce(search, 300);
  const debouncedGenre = useDebounce(genre, 300);

  const selectedSortLabel =
    sortOptions.find(
      (option) => option.sortBy === sortBy && option.order === order
    )?.label ?? sortOptions[0].label;

  useEffect(() => {
    setPage((current) => (current === 1 ? current : 1));
  }, [debouncedSearch, debouncedGenre, sortBy, order]);

  useEffect(() => {
    let cancelled = false;

    const fetchBooks = async () => {
      setIsLoading(true);
      setError("");
      try {
        const params = {
          page,
          limit,
          sortBy,
          order,
        };
        if (debouncedSearch) params.search = debouncedSearch;
        if (debouncedGenre) params.genre = debouncedGenre;

        const response = await getBooks(params);
        if (cancelled) return;

        setBooks(response.data ?? []);
        setTotal(response.meta?.total ?? 0);
        setTotalPages(response.meta?.totalPages ?? 1);
      } catch (fetchError) {
        if (cancelled) return;
        const message =
          fetchError.response?.data?.message ??
          "Unable to load books right now.";
        setError(message);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchBooks();

    return () => {
      cancelled = true;
    };
  }, [
    page,
    limit,
    debouncedSearch,
    debouncedGenre,
    sortBy,
    order,
    lastMutationAt,
  ]);

  const handleSortChange = (event) => {
    const option = sortOptions.find(
      (item) => item.label === event.target.value
    );
    if (!option) return;
    setSortBy(option.sortBy);
    setOrder(option.order);
  };

  const resetFilters = () => {
    setSearch("");
    setGenre("");
    setSortBy("createdAt");
    setOrder("desc");
  };

  const handlePageChange = (nextPage) => {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-heading font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          Discover your next favorite book
        </h1>
        <p className="max-w-3xl text-sm text-slate-600 dark:text-slate-300">
          Browse community-curated reviews, explore trending titles, and share
          your own thoughts once you’re signed in.
        </p>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-4 md:grid-cols-[2fr,1fr,1fr] md:items-end">
          <div className="space-y-2">
            <label
              htmlFor="search"
              className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              <FiSearch className="h-4 w-4" /> Search by title or author
            </label>
            <div className="relative">
              <input
                id="search"
                type="search"
                placeholder="e.g. The Great Gatsby"
                className="w-full rounded-md border border-slate-300 px-10 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <FiSearch className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="genre"
              className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              <FiSliders className="h-4 w-4" /> Filter by genre
            </label>
            <input
              id="genre"
              type="text"
              placeholder="e.g. Fantasy"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              value={genre}
              onChange={(event) => setGenre(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="sort"
              className="text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Sort results
            </label>
            <select
              id="sort"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              onChange={handleSortChange}
              value={selectedSortLabel}
            >
              {sortOptions.map((option) => (
                <option key={option.label} value={option.label}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-300">
          <span>
            Showing page {page} of {totalPages} ({total} total books)
          </span>
          <button
            type="button"
            onClick={resetFilters}
            className="text-brand-600 hover:text-brand-700 dark:text-brand-400"
          >
            Clear filters
          </button>
        </div>
      </section>

      <section className="space-y-6">
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: limit }).map((_, index) => (
              <div
                key={index}
                className="h-48 animate-pulse rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900/40"
              />
            ))}
          </div>
        ) : error ? (
          <div className="flex items-center gap-3 rounded-xl border border-rose-400 bg-rose-50 p-4 text-rose-600 dark:border-rose-500/60 dark:bg-rose-500/10 dark:text-rose-200">
            <IoWarningOutline className="h-5 w-5" />
            <span>{error}</span>
          </div>
        ) : books.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500 dark:border-slate-700 dark:text-slate-300">
            No books match your filters yet. Try adjusting your search or add a
            new book!
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {books.map((book) => (
              <BookCard key={book._id} book={book} />
            ))}
          </div>
        )}
      </section>

      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1 || isLoading}
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <FiChevronLeft className="h-4 w-4" /> Previous
          </button>
          <span className="text-sm text-slate-500 dark:text-slate-300">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages || isLoading}
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Next <FiChevronRight className="h-4 w-4" />
          </button>
        </nav>
      )}
    </div>
  );
};

export default HomePage;
