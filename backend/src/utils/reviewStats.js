const Review = require("../models/review.model");

const baseDistribution = () => ({
  1: 0,
  2: 0,
  3: 0,
  4: 0,
  5: 0,
});

const normaliseDistribution = (rows = []) => {
  const distribution = baseDistribution();
  rows.forEach((row) => {
    const rating = Number(row._id);
    if (distribution[rating] !== undefined) {
      distribution[rating] = row.count;
    }
  });
  return distribution;
};

exports.getAggregateStatsForBook = async (bookId) => {
  const [result] = await Review.aggregate([
    { $match: { bookId } },
    {
      $facet: {
        summary: [
          {
            $group: {
              _id: null,
              averageRating: { $avg: "$rating" },
              reviewCount: { $sum: 1 },
            },
          },
        ],
        distribution: [
          {
            $group: {
              _id: "$rating",
              count: { $sum: 1 },
            },
          },
        ],
      },
    },
  ]);

  const summary = result?.summary?.[0] ?? {};

  return {
    averageRating: summary.averageRating
      ? Number(summary.averageRating.toFixed(2))
      : null,
    reviewCount: summary.reviewCount ?? 0,
    distribution: normaliseDistribution(result?.distribution ?? []),
  };
};

exports.getAggregateStatsForBooks = async (bookIds) => {
  if (!bookIds.length) return new Map();

  const stats = await Review.aggregate([
    { $match: { bookId: { $in: bookIds } } },
    {
      $group: {
        _id: "$bookId",
        averageRating: { $avg: "$rating" },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  return new Map(
    stats.map((item) => [
      item._id.toString(),
      {
        averageRating: item.averageRating
          ? Number(item.averageRating.toFixed(2))
          : null,
        reviewCount: item.reviewCount ?? 0,
      },
    ])
  );
};
