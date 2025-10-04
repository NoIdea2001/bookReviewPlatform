const router = require("express").Router();
const { protect } = require("../middlewares/auth.middleware");
const {
  addReview,
  getReviews,
  updateReview,
  deleteReview,
} = require("../controllers/review.controller");

router.post("/:bookId", protect, addReview);
router.get("/:bookId", getReviews);
router.put("/:bookId/:reviewId", protect, updateReview);
router.delete("/:bookId/:reviewId", protect, deleteReview);

module.exports = router;
