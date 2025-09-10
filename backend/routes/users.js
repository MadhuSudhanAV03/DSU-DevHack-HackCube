const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/auth");

router.get("/me", requireAuth, (req, res) => {
  // req.user set by middleware
  res.status(200).json({ user: req.user });
});

module.exports = router;
