import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { FiLoader } from "react-icons/fi";
import { useBooks } from "../providers/BooksProvider.jsx";

const BookFormPage = ({ mode }) => {
  const isEdit = mode === "edit";
  const navigate = useNavigate();
  const { bookId } = useParams();
  const { createBook, updateBook, getBookById, isMutating } = useBooks();
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(isEdit);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    defaultValues: {
      title: "",
      author: "",
      description: "",
      genre: "",
      year: "",
    },
  });

  useEffect(() => {
    if (!isEdit) return;
    if (!bookId) {
      setServerError("Missing book identifier.");
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const fetchBook = async () => {
      setIsLoading(true);
      setServerError("");
      try {
        const data = await getBookById(bookId);
        if (cancelled) return;
        reset({
          title: data.title ?? "",
          author: data.author ?? "",
          description: data.description ?? "",
          genre: data.genre ?? "",
          year: data.year ? String(data.year) : "",
        });
      } catch (error) {
        if (cancelled) return;
        const message =
          error.response?.data?.message ??
          "Unable to load book details. It may have been removed.";
        setServerError(message);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchBook();

    return () => {
      cancelled = true;
    };
  }, [isEdit, bookId, getBookById, reset]);

  const onSubmit = async (values) => {
    setServerError("");
    const payload = {
      title: values.title.trim(),
      author: values.author.trim() || undefined,
      description: values.description.trim() || undefined,
      genre: values.genre.trim() || undefined,
    };

    if (values.year) {
      const parsedYear = Number(values.year);
      if (!Number.isNaN(parsedYear)) {
        payload.year = parsedYear;
      }
    }

    try {
      const book = isEdit
        ? await updateBook(bookId, payload)
        : await createBook(payload);
      navigate(`/books/${book._id}`, { replace: true });
    } catch (error) {
      const message =
        error.response?.data?.message ??
        "Unable to save your changes right now. Please try again.";
      setServerError(message);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-heading font-semibold">
          {isEdit ? "Update book details" : "Add a new book"}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-300">
          Provide accurate information to help other readers discover and review
          titles.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 p-6 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-300">
          <FiLoader className="h-5 w-5 animate-spin" /> Loading book details...
        </div>
      ) : (
        <form
          className="space-y-5"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <div className="space-y-2">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Title
            </label>
            <input
              id="title"
              type="text"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              {...register("title", {
                required: "Title is required",
                minLength: {
                  value: 2,
                  message: "Title must be at least 2 characters",
                },
              })}
            />
            {errors.title && (
              <p className="text-sm text-rose-500">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="author"
              className="block text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Author
            </label>
            <input
              id="author"
              type="text"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              {...register("author")}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Description
            </label>
            <textarea
              id="description"
              rows="4"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              {...register("description", {
                minLength: {
                  value: 10,
                  message: "Description should be at least 10 characters",
                },
              })}
            />
            {errors.description && (
              <p className="text-sm text-rose-500">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="genre"
                className="block text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Genre
              </label>
              <input
                id="genre"
                type="text"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                {...register("genre")}
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="year"
                className="block text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Published year
              </label>
              <input
                id="year"
                type="number"
                min="0"
                max={new Date().getFullYear()}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                {...register("year", {
                  validate: (value) => {
                    if (!value) return true;
                    const parsedYear = Number(value);
                    if (Number.isNaN(parsedYear)) {
                      return "Enter a valid year";
                    }
                    if (parsedYear < 0) {
                      return "Year must be a positive number";
                    }
                    if (parsedYear > new Date().getFullYear()) {
                      return "Year cannot be in the future";
                    }
                    return true;
                  },
                })}
              />
              {errors.year && (
                <p className="text-sm text-rose-500">{errors.year.message}</p>
              )}
            </div>
          </div>

          {serverError && (
            <div className="rounded-md border border-rose-400 bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:border-rose-500/60 dark:bg-rose-500/10 dark:text-rose-200">
              {serverError}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || isMutating}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 dark:focus:ring-offset-slate-900"
          >
            {(isSubmitting || isMutating) && (
              <FiLoader className="h-4 w-4 animate-spin" />
            )}
            {isEdit ? "Save changes" : "Create book"}
          </button>
        </form>
      )}
    </div>
  );
};

BookFormPage.propTypes = {
  mode: PropTypes.oneOf(["create", "edit"]).isRequired,
};

export default BookFormPage;
