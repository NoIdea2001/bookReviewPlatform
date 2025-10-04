const router = require("express").Router();

router.use("/auth", require("./auth.routes"));
router.use("/books", require("./book.routes"));
router.use("/reviews", require("./review.routes"));
router.use("/users", require("./user.routes"));

module.exports = router;
