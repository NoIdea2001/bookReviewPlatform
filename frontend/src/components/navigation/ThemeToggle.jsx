import { useContext } from "react";
import { ThemeContext } from "../../providers/AppProviders.jsx";
import { LuMoon, LuSun } from "react-icons/lu";

const ThemeToggle = () => {
  const { mode, toggle } = useContext(ThemeContext);

  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-offset-slate-900"
      aria-label="Toggle color theme"
    >
      {mode === "dark" ? (
        <LuSun className="h-5 w-5" />
      ) : (
        <LuMoon className="h-5 w-5" />
      )}
    </button>
  );
};

export default ThemeToggle;
