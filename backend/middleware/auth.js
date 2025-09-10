// backend/middleware/auth.js
const jwt = require("jsonwebtoken");
const asyncWrapper = require("./async");
const { createCustomError } = require("../errors/custom-errors");
const User = require("../models/users");

const requireAuth = asyncWrapper(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(createCustomError("Authentication invalid", 401));
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // attach user (optional)
    const user = await User.findById(payload.userId).select(
      "-password -refreshTokenHash"
    );
    if (!user) return next(createCustomError("User not found", 401));
    req.user = user;
    next();
  } catch (err) {
    return next(createCustomError("Authentication invalid or expired", 401));
  }
});

module.exports = requireAuth;
