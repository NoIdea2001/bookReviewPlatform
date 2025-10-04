import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { FiBookOpen, FiLoader, FiStar } from "react-icons/fi";
import { getCurrentUserProfile } from "../services/user.service.js";
import { useAuth } from "../state/auth.store.js";

const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchProfile = async () => {
      setIsLoading(true);
      setError("");
      try {
        const data = await getCurrentUserProfile();
        if (!cancelled) setProfile(data);
      } catch (fetchError) {
        if (!cancelled) {
          const message =
            fetchError.response?.data?.message ??
            "Unable to load your profile right now.";
          setError(message);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-slate-500 dark:text-slate-300">
        <FiLoader className="mr-2 h-5 w-5 animate-spin" /> Loading your
        library...
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl rounded-xl border border-rose-400 bg-rose-50 p-6 text-center text-rose-600 dark:border-rose-500/60 dark:bg-rose-500/10 dark:text-rose-200">
        {error}
      </div>
    );
  }

  const profileUser = profile?.user ?? user;
  const books = profile?.books ?? [];
  const reviews = profile?.reviews ?? [];
  const joinedAt = profileUser?.createdAt
    ? new Date(profileUser.createdAt)
    : null;

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-heading font-semibold text-slate-900 dark:text-slate-100">
          Your library
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-300">
          Track the books you have added and the reviews you have shared with
          the community.
        </p>
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
          <p className="font-medium">{profileUser?.name}</p>
          <p className="text-slate-500 dark:text-slate-400">
            {profileUser?.email}
          </p>
          {joinedAt && (
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Member since {format(joinedAt, "MMMM dd, yyyy")}
            </p>
          )}
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Books you added
            </h2>
            <Link
              to="/books/new"
              className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
            >
              <FiBookOpen className="h-4 w-4" /> Add book
            </Link>
          </div>
          {books.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-300">
              You haven’t added any books yet. Share a favorite title with the
              community!
            </p>
          ) : (
            <ul className="space-y-3">
              {books.map((book) => (
                <li
                  key={book._id}
                  className="flex flex-col gap-1 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
                >
                  <Link
                    to={`/books/${book._id}`}
                    className="text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400"
                  >
                    {book.title}
                  </Link>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {book.author || "Unknown author"}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <span>
                      <FiStar className="mr-1 inline h-3 w-3 text-amber-500" />
                      {book.averageRating
                        ? book.averageRating.toFixed(1)
                        : "N/A"}
                    </span>
                    <span>
                      {book.reviewCount} review
                      {book.reviewCount === 1 ? "" : "s"}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Your reviews
          </h2>
          {reviews.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-300">
              Your reviews will appear here once you start sharing feedback.
            </p>
          ) : (
            <ul className="space-y-3">
              {reviews.map((review) => (
                <li
                  key={review._id}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm dark:border-slate-700 dark:bg-slate-900"
                >
                  <Link
                    to={`/books/${review.book?._id}`}
                    className="font-semibold text-brand-600 hover:underline dark:text-brand-400"
                  >
                    {review.book?.title || "Unknown title"}
                  </Link>
                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <FiStar className="h-3 w-3 text-amber-500" />
                    {Number(review.rating).toFixed(1)}
                    {review.book?.author && <span>• {review.book.author}</span>}
                  </div>
                  {review.reviewText && (
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-300">
                      {review.reviewText.length > 180
                        ? `${review.reviewText.slice(0, 177)}...`
                        : review.reviewText}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
};

export default ProfilePage;
