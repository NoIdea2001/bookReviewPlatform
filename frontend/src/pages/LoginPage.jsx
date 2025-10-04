import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { login } from "../services/auth.service.js";
import { useAuth } from "../state/auth.store.js";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const setCredentials = useAuth((state) => state.setCredentials);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const redirectTo = location.state?.from?.pathname || "/";

  const onSubmit = async (values) => {
    setServerError("");
    try {
      const result = await login(values);
      setCredentials(result);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Invalid credentials. Please try again.";
      setServerError(message);
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-6 rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-heading font-semibold">Welcome back</h1>
        <p className="text-sm text-slate-500 dark:text-slate-300">
          Log in to continue reviewing and discovering books.
        </p>
      </div>
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /[^\s@]+@[^\s@]+\.[^\s@]+/,
                message: "Enter a valid email address",
              },
            })}
          />
          {errors.email && (
            <p className="text-sm text-rose-500">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            {...register("password", {
              required: "Password is required",
            })}
          />
          {errors.password && (
            <p className="text-sm text-rose-500">{errors.password.message}</p>
          )}
        </div>

        {serverError && (
          <div className="rounded-md border border-rose-400 bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:border-rose-500/60 dark:bg-rose-500/10 dark:text-rose-200">
            {serverError}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center rounded-md bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 dark:focus:ring-offset-slate-900"
        >
          {isSubmitting ? "Signing in..." : "Log in"}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500 dark:text-slate-300">
        Need an account?{" "}
        <Link
          to="/signup"
          className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
        >
          Create one here
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;
