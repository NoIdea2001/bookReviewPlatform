const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-slate-200 bg-white/90 py-4 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 sm:flex-row sm:px-6 lg:px-8">
        <p>© {year} BookReview Platform. All rights reserved.</p>
        <p className="flex items-center gap-2">
          <span role="img" aria-label="sparkles">
            ✨
          </span>
          Crafted for curious readers
        </p>
      </div>
    </footer>
  );
};

export default Footer;
