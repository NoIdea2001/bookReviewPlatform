const router = require("express").Router();
const { protect } = require("../middlewares/auth.middleware");
const { getCurrentUserProfile } = require("../controllers/user.controller");

router.get("/me", protect, getCurrentUserProfile);

module.exports = router;
