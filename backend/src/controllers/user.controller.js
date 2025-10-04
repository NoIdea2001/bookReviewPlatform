const asyncHandler = require("../utils/asyncHandler");
const Book = require("../models/book.model");
const Review = require("../models/review.model");
const { getAggregateStatsForBooks } = require("../utils/reviewStats");

exports.getCurrentUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [booksRaw, reviewsRaw] = await Promise.all([
    Book.find({ addedBy: userId }).sort({ createdAt: -1 }).lean(),
    Review.find({ userId })
      .sort({ createdAt: -1 })
      .populate("bookId", "title author genre year")
      .lean(),
  ]);

  const statsMap = await getAggregateStatsForBooks(
    booksRaw.map((book) => book._id)
  );

  const books = booksRaw.map((book) => {
    const stats = statsMap.get(book._id.toString()) ?? {};
    return {
      ...book,
      averageRating: stats.averageRating ?? null,
      reviewCount: stats.reviewCount ?? 0,
    };
  });

  const reviews = reviewsRaw.map((review) => ({
    ...review,
    book: review.bookId,
  }));

  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      createdAt: req.user.createdAt,
    },
    books,
    reviews,
  });
});
