const mongoose = require("mongoose");
const Book = require("../models/book.model");
const Review = require("../models/review.model");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appError");
const {
  getAggregateStatsForBook,
  getAggregateStatsForBooks,
} = require("../utils/reviewStats");

const pickBookFields = (body = {}) => {
  const allowedFields = ["title", "author", "description", "genre", "year"];
  return allowedFields.reduce((acc, field) => {
    if (body[field] !== undefined) {
      if (field === "year") {
        const parsedYear = Number(body[field]);
        if (!Number.isNaN(parsedYear)) {
          acc[field] = parsedYear;
        }
      } else {
        acc[field] = body[field];
      }
    }
    return acc;
  }, {});
};

exports.addBook = asyncHandler(async (req, res) => {
  const payload = pickBookFields(req.body);
  const book = await Book.create({ ...payload, addedBy: req.user._id });
  res.status(201).json(book);
});

exports.getBooks = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(
    20,
    Math.max(1, Number.parseInt(req.query.limit, 10) || 5)
  );
  const search = req.query.search?.trim();
  const genre = req.query.genre?.trim();
  const sortBy = req.query.sortBy?.trim();
  const sortOrder = req.query.order === "asc" ? 1 : -1;

  const filter = {};
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { author: { $regex: search, $options: "i" } },
    ];
  }

  if (genre) {
    filter.genre = { $regex: `^${genre}$`, $options: "i" };
  }

  const sort = {};
  if (sortBy === "year") {
    sort.year = sortOrder;
  } else if (sortBy === "title") {
    sort.title = sortOrder;
  } else {
    sort.createdAt = -1;
  }

  const total = await Book.countDocuments(filter);
  const booksRaw = await Book.find(filter)
    .populate("addedBy", "name email")
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  const statsMap = await getAggregateStatsForBooks(
    booksRaw.map((book) => book._id)
  );

  let books = booksRaw.map((book) => {
    const stats = statsMap.get(book._id.toString());
    return {
      ...book,
      averageRating: stats?.averageRating ?? null,
      reviewCount: stats?.reviewCount ?? 0,
    };
  });
  if (sortBy === "rating") {
    books = books.sort((a, b) => {
      const aRating = a.averageRating ?? 0;
      const bRating = b.averageRating ?? 0;
      return sortOrder === 1 ? aRating - bRating : bRating - aRating;
    });
  }

  res.json({
    data: books,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  });
});

exports.getBookById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError("Invalid book id", 400));
  }

  const book = await Book.findById(id).populate("addedBy", "name email");
  if (!book) {
    return next(new AppError("Book not found", 404));
  }

  const [stats, reviews] = await Promise.all([
    getAggregateStatsForBook(book._id),
    Review.find({ bookId: book._id })
      .sort({ createdAt: -1 })
      .populate("userId", "name")
      .lean(),
  ]);

  res.json({
    ...book.toObject(),
    averageRating: stats.averageRating,
    reviewCount: stats.reviewCount,
    ratingDistribution: stats.distribution,
    reviews,
  });
});

exports.updateBook = asyncHandler(async (req, res, next) => {
  const book = await Book.findById(req.params.id);
  if (!book) {
    return next(new AppError("Book not found", 404));
  }
  if (book.addedBy.toString() !== req.user._id.toString()) {
    return next(new AppError("Not authorized to modify this book", 403));
  }

  Object.assign(book, pickBookFields(req.body));
  await book.save();
  res.json(book);
});

exports.deleteBook = asyncHandler(async (req, res, next) => {
  const book = await Book.findById(req.params.id);
  if (!book) {
    return next(new AppError("Book not found", 404));
  }
  if (book.addedBy.toString() !== req.user._id.toString()) {
    return next(new AppError("Not authorized to modify this book", 403));
  }

  const { deletedCount } = await Review.deleteMany({ bookId: book._id });
  await book.deleteOne();

  res.json({ message: "Book deleted", removedReviews: deletedCount });
});
