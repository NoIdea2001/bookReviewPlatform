import PropTypes from "prop-types";
import { useState, useMemo, useEffect, createContext } from "react";
import { BooksProvider } from "./BooksProvider.jsx";

export const ThemeContext = createContext({
  mode: "light",
  toggle: () => {},
});

export const AppProviders = ({ children }) => {
  const [mode, setMode] = useState(() => {
    if (typeof window !== "undefined") {
      return window.localStorage.getItem("theme-mode") || "light";
    }
    return "light";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.classList.toggle("dark", mode === "dark");
    }
  }, [mode]);

  const value = useMemo(
    () => ({
      mode,
      toggle: () => {
        setMode((prev) => {
          const next = prev === "light" ? "dark" : "light";
          if (typeof window !== "undefined") {
            window.localStorage.setItem("theme-mode", next);
            document.documentElement.classList.toggle("dark", next === "dark");
          }
          return next;
        });
      },
    }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={value}>
      <BooksProvider>{children}</BooksProvider>
    </ThemeContext.Provider>
  );
};

AppProviders.propTypes = {
  children: PropTypes.node,
};
