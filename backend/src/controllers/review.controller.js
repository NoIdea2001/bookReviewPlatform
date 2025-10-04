const mongoose = require("mongoose");
const Review = require("../models/review.model");
const Book = require("../models/book.model");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appError");
const { getAggregateStatsForBook } = require("../utils/reviewStats");

exports.addReview = asyncHandler(async (req, res, next) => {
  const { rating, reviewText } = req.body;
  const bookId = req.params.bookId;

  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    return next(new AppError("Invalid book id", 400));
  }

  const bookObjectId = new mongoose.Types.ObjectId(bookId);

  const book = await Book.findById(bookObjectId);
  if (!book) {
    return next(new AppError("Book not found", 404));
  }

  const existingReview = await Review.findOne({
    bookId: bookObjectId,
    userId: req.user._id,
  });
  if (existingReview) {
    return next(new AppError("You have already reviewed this book", 400));
  }

  const parsedRating = Number(rating);
  if (Number.isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
    return next(new AppError("Rating must be a number between 1 and 5", 400));
  }

  const review = await Review.create({
    bookId: bookObjectId,
    userId: req.user._id,
    rating: parsedRating,
    reviewText,
  });

  await review.populate("userId", "name");

  const stats = await getAggregateStatsForBook(review.bookId);

  res.status(201).json({ review, stats });
});

exports.updateReview = asyncHandler(async (req, res, next) => {
  const { rating, reviewText } = req.body;
  const { bookId, reviewId } = req.params;

  if (
    !mongoose.Types.ObjectId.isValid(bookId) ||
    !mongoose.Types.ObjectId.isValid(reviewId)
  ) {
    return next(new AppError("Invalid review reference", 400));
  }

  const bookObjectId = new mongoose.Types.ObjectId(bookId);

  const conditions = {
    _id: reviewId,
    bookId: bookObjectId,
    userId: req.user._id,
  };

  const review = await Review.findOne(conditions);
  if (!review) {
    return next(new AppError("Review not found", 404));
  }

  if (rating !== undefined) {
    const parsedRating = Number(rating);
    if (Number.isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return next(new AppError("Rating must be a number between 1 and 5", 400));
    }
    review.rating = parsedRating;
  }

  if (reviewText !== undefined) {
    review.reviewText = reviewText;
  }

  await review.save();
  await review.populate("userId", "name");

  const stats = await getAggregateStatsForBook(review.bookId);

  res.json({ review, stats });
});

exports.deleteReview = asyncHandler(async (req, res, next) => {
  const { bookId, reviewId } = req.params;

  if (
    !mongoose.Types.ObjectId.isValid(bookId) ||
    !mongoose.Types.ObjectId.isValid(reviewId)
  ) {
    return next(new AppError("Invalid review reference", 400));
  }

  const bookObjectId = new mongoose.Types.ObjectId(bookId);

  const conditions = {
    _id: reviewId,
    bookId: bookObjectId,
    userId: req.user._id,
  };

  const review = await Review.findOne(conditions);
  if (!review) {
    return next(new AppError("Review not found", 404));
  }

  await review.deleteOne();

  const stats = await getAggregateStatsForBook(review.bookId);

  res.json({ message: "Review deleted", stats });
});

exports.getReviews = asyncHandler(async (req, res, next) => {
  const { bookId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    return next(new AppError("Invalid book id", 400));
  }

  const bookObjectId = new mongoose.Types.ObjectId(bookId);

  const bookExists = await Book.exists({ _id: bookObjectId });
  if (!bookExists) {
    return next(new AppError("Book not found", 404));
  }

  const [reviews, stats] = await Promise.all([
    Review.find({ bookId: bookObjectId })
      .sort({ createdAt: -1 })
      .populate("userId", "name")
      .lean(),
    getAggregateStatsForBook(bookObjectId),
  ]);

  res.json({ ...stats, reviews });
});
