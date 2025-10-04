import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { FiEdit2, FiLoader, FiStar, FiTrash2 } from "react-icons/fi";
import { useForm } from "react-hook-form";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { getBookById } from "../services/book.service.js";
import {
  addReview,
  deleteReview,
  updateReview,
} from "../services/review.service.js";
import { useAuth } from "../state/auth.store.js";
import { useBooks } from "../providers/BooksProvider.jsx";

const emptyDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

const BookDetailsPage = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { deleteBook, isMutating } = useBooks();

  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({
    averageRating: null,
    reviewCount: 0,
    distribution: emptyDistribution,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [serverError, setServerError] = useState("");
  const [isDeletingBook, setIsDeletingBook] = useState(false);
  const [isDeletingReview, setIsDeletingReview] = useState(false);

  const currentUserReview = useMemo(() => {
    if (!user) return null;
    return reviews.find((review) => review.userId?._id === user._id);
  }, [reviews, user]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      rating: currentUserReview?.rating ?? 5,
      reviewText: currentUserReview?.reviewText ?? "",
    },
  });

  useEffect(() => {
    reset({
      rating: currentUserReview?.rating ?? 5,
      reviewText: currentUserReview?.reviewText ?? "",
    });
  }, [currentUserReview, reset]);

  useEffect(() => {
    let cancelled = false;

    const fetchBook = async () => {
      setIsLoading(true);
      setServerError("");
      try {
        const data = await getBookById(bookId);
        if (cancelled) return;
        setBook(data);
        setReviews(data.reviews ?? []);
        setStats({
          averageRating: data.averageRating ?? null,
          reviewCount: data.reviewCount ?? 0,
          distribution: data.ratingDistribution ?? emptyDistribution,
        });
      } catch (error) {
        if (cancelled) return;
        const message =
          error.response?.data?.message ??
          "Unable to load this book right now. It might have been removed.";
        setServerError(message);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchBook();

    return () => {
      cancelled = true;
    };
  }, [bookId]);

  const chartData = useMemo(() => {
    const distribution = stats.distribution ?? emptyDistribution;
    return Object.entries(distribution)
      .map(([rating, count]) => ({ rating, count }))
      .sort((a, b) => Number(a.rating) - Number(b.rating));
  }, [stats.distribution]);

  const handleDeleteBook = async () => {
    if (!book?._id) return;
    if (
      !window.confirm(
        "Deleting this book will also remove all associated reviews. Continue?"
      )
    ) {
      return;
    }

    setIsDeletingBook(true);
    setServerError("");
    try {
      await deleteBook(book._id);
      navigate("/", { replace: true });
    } catch (error) {
      const message =
        error.response?.data?.message ??
        "Unable to delete this book. Please try again.";
      setServerError(message);
    } finally {
      setIsDeletingBook(false);
    }
  };

  const onSubmitReview = async (values) => {
    if (!book?._id) return;
    setServerError("");
    try {
      if (currentUserReview) {
        const { review, stats: updatedStats } = await updateReview(
          book._id,
          currentUserReview._id,
          {
            rating: Number(values.rating),
            reviewText: values.reviewText?.trim(),
          }
        );
        setReviews((prev) =>
          prev.map((item) => (item._id === review._id ? review : item))
        );
        setStats(updatedStats);
      } else {
        const { review, stats: updatedStats } = await addReview(book._id, {
          rating: Number(values.rating),
          reviewText: values.reviewText?.trim(),
        });
        setReviews((prev) => [review, ...prev]);
        setStats(updatedStats);
      }
    } catch (error) {
      const message =
        error.response?.data?.message ??
        "Unable to save your review. Please try again.";
      setServerError(message);
    }
  };

  const handleDeleteReview = async () => {
    if (!book?._id || !currentUserReview?._id) return;
    if (!window.confirm("Remove your review for this book?")) return;

    setIsDeletingReview(true);
    setServerError("");
    try {
      const { stats: updatedStats } = await deleteReview(
        book._id,
        currentUserReview._id
      );
      setReviews((prev) =>
        prev.filter((review) => review._id !== currentUserReview._id)
      );
      setStats(updatedStats);
      reset({ rating: 5, reviewText: "" });
    } catch (error) {
      const message =
        error.response?.data?.message ??
        "Unable to remove your review right now.";
      setServerError(message);
    } finally {
      setIsDeletingReview(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-slate-500 dark:text-slate-300">
        <FiLoader className="mr-2 h-5 w-5 animate-spin" /> Loading book
        details...
      </div>
    );
  }

  if (serverError && !book) {
    return (
      <div className="mx-auto max-w-2xl rounded-xl border border-rose-400 bg-rose-50 p-6 text-center text-rose-600 dark:border-rose-500/60 dark:bg-rose-500/10 dark:text-rose-200">
        {serverError}
      </div>
    );
  }

  const isOwner = book?.addedBy?._id === user?._id;

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-heading font-semibold text-slate-900 dark:text-slate-100">
              {book?.title}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {book?.author || "Unknown author"}
              {book?.genre ? ` • ${book.genre}` : ""}
              {book?.year ? ` • ${book.year}` : ""}
            </p>
            {book?.addedBy?.name && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Added by {book.addedBy.name}
              </p>
            )}
          </div>
          {isOwner && (
            <div className="flex items-center gap-2">
              <Link
                to={`/books/${book._id}/edit`}
                className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <FiEdit2 className="h-4 w-4" /> Edit
              </Link>
              <button
                type="button"
                onClick={handleDeleteBook}
                disabled={isMutating || isDeletingBook}
                className="inline-flex items-center gap-2 rounded-md border border-rose-400 px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 dark:border-rose-500/60 dark:text-rose-300 dark:hover:bg-rose-500/10 dark:focus:ring-offset-slate-900"
              >
                {(isMutating || isDeletingBook) && (
                  <FiLoader className="h-4 w-4 animate-spin" />
                )}
                Delete
              </button>
            </div>
          )}
        </div>
        {serverError && (
          <div className="rounded-md border border-rose-400 bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:border-rose-500/60 dark:bg-rose-500/10 dark:text-rose-200">
            {serverError}
          </div>
        )}
      </header>

      <section className="grid gap-6 md:grid-cols-[2fr,1fr]">
        <article className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Description
          </h2>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {book?.description || "No description provided yet."}
          </p>
        </article>
        <aside className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Average rating
            </h3>
            <p className="flex items-center justify-center gap-2 text-4xl font-bold text-brand-500">
              <FiStar className="h-8 w-8" />
              {stats.averageRating ? stats.averageRating.toFixed(1) : "N/A"}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-300">
              Based on {stats.reviewCount} review
              {stats.reviewCount === 1 ? "" : "s"}
            </p>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 16, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="rating" tickLine={false} axisLine={false} />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(value) => [
                    `${value} review${value === 1 ? "" : "s"}`,
                    "Count",
                  ]}
                  cursor={{ fill: "rgba(59, 130, 246, 0.1)" }}
                />
                <Bar dataKey="count" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </aside>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Community reviews
          </h2>
          {stats.reviewCount > 0 && (
            <span className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-300">
              Latest first
            </span>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {isAuthenticated ? (
            <form
              className="space-y-4"
              onSubmit={handleSubmit(onSubmitReview)}
              noValidate
            >
              <div className="grid gap-4 md:grid-cols-[1fr,3fr]">
                <div className="space-y-1">
                  <label
                    htmlFor="rating"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-200"
                  >
                    Your rating
                  </label>
                  <select
                    id="rating"
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    {...register("rating", { required: true })}
                  >
                    {[5, 4, 3, 2, 1].map((value) => (
                      <option key={value} value={value}>
                        {value} star{value === 1 ? "" : "s"}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label
                    htmlFor="reviewText"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-200"
                  >
                    Share your thoughts
                  </label>
                  <textarea
                    id="reviewText"
                    rows="3"
                    placeholder="What did you think about this book?"
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    {...register("reviewText", {
                      minLength: {
                        value: 10,
                        message: "Review should be at least 10 characters",
                      },
                      maxLength: {
                        value: 1000,
                        message: "Review cannot exceed 1000 characters",
                      },
                    })}
                  />
                  {errors.reviewText && (
                    <p className="text-sm text-rose-500">
                      {errors.reviewText.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-md bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 dark:focus:ring-offset-slate-900"
                >
                  {isSubmitting && (
                    <FiLoader className="h-4 w-4 animate-spin" />
                  )}
                  {currentUserReview ? "Update review" : "Submit review"}
                </button>
                {currentUserReview && (
                  <button
                    type="button"
                    onClick={handleDeleteReview}
                    disabled={isDeletingReview}
                    className="inline-flex items-center gap-2 rounded-md border border-rose-400 px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 dark:border-rose-500/60 dark:text-rose-300 dark:hover:bg-rose-500/10 dark:focus:ring-offset-slate-900"
                  >
                    {isDeletingReview ? (
                      <FiLoader className="h-4 w-4 animate-spin" />
                    ) : (
                      <FiTrash2 className="h-4 w-4" />
                    )}
                    Remove review
                  </button>
                )}
              </div>
            </form>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-slate-300 px-6 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-300">
              <p>
                <Link
                  to="/login"
                  className="font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
                >
                  Log in
                </Link>{" "}
                or{" "}
                <Link
                  to="/signup"
                  className="font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
                >
                  create an account
                </Link>{" "}
                to share your review.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 px-6 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-300">
              No reviews yet. Be the first to share your thoughts!
            </div>
          ) : (
            <ul className="space-y-4">
              {reviews.map((review) => {
                const createdAt = review.createdAt
                  ? new Date(review.createdAt)
                  : null;
                return (
                  <li
                    key={review._id}
                    className="space-y-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                        <FiStar className="h-4 w-4 text-amber-500" />
                        {Number(review.rating).toFixed(1)}
                        <span className="ml-2 text-xs font-normal text-slate-500 dark:text-slate-300">
                          {review.userId?.name || "Anonymous"}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        {createdAt
                          ? formatDistanceToNow(createdAt, { addSuffix: true })
                          : "Just now"}
                      </span>
                    </div>
                    {review.reviewText && (
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        {review.reviewText}
                      </p>
                    )}
                    {currentUserReview?._id === review._id && (
                      <p className="text-xs uppercase tracking-wide text-brand-500">
                        Your review
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
};

export default BookDetailsPage;
