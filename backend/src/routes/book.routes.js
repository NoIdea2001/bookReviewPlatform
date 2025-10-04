const router = require("express").Router();
const { protect } = require("../middlewares/auth.middleware");
const {
  addBook,
  getBooks,
  getBookById,
  updateBook,
  deleteBook,
} = require("../controllers/book.controller");

router.get("/", getBooks);
router.get("/:id", getBookById);
router.post("/", protect, addBook);
router.put("/:id", protect, updateBook);
router.delete("/:id", protect, deleteBook);

module.exports = router;
