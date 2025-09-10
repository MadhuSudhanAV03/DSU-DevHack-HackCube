// backend/controllers/authController.js
const User = require("../models/users");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const asyncWrapper = require("../middleware/async");
const { createCustomError } = require("../errors/custom-errors");

// helper: create tokens
const createAccessToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "15m" });

const createRefreshToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: "12h" });

// cookie options (reuse everywhere)
const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 12 * 60 * 60 * 1000, // 12 hours in ms
};

// ======= SIGNUP =======
const signup = asyncWrapper(async (req, res, next) => {
  const { name, username, email, password } = req.body;
  if (!username || !email || !password) {
    return next(
      createCustomError("Username, email, and password are required", 400)
    );
  }

  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    return next(createCustomError("Email or username already in use", 400));
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    username,
    email,
    password: hashedPassword,
  });

  // generate tokens
  const accessToken = createAccessToken(user._id);
  const refreshToken = createRefreshToken(user._id);

  // store hashed refresh token in DB
  const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
  user.refreshTokenHash = refreshTokenHash;
  await user.save();

  // set refreshToken cookie
  res.cookie("refreshToken", refreshToken, refreshCookieOptions);

  res.status(201).json({
    msg: "User created successfully",
    accessToken,
    user: { id: user._id, username: user.username, email: user.email },
  });
});

// ======= LOGIN =======
const login = asyncWrapper(async (req, res, next) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    return next(
      createCustomError("Username/Email and password are required", 400)
    );
  }

  const user = await User.findOne({
    $or: [{ email: identifier }, { username: identifier }],
  });
  if (!user) return next(createCustomError("Invalid credentials", 400));

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return next(createCustomError("Invalid credentials", 400));

  const accessToken = createAccessToken(user._id);
  const refreshToken = createRefreshToken(user._id);

  // store hashed refresh token
  const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
  user.refreshTokenHash = refreshTokenHash;
  await user.save();

  res.cookie("refreshToken", refreshToken, refreshCookieOptions);

  res.status(200).json({
    msg: "Login successful",
    accessToken,
    user: { id: user._id, username: user.username, email: user.email },
  });
});

// ======= REFRESH =======
// Verify cookie token, compare with stored hash, rotate (issue new refresh token + hash)
const refresh = asyncWrapper(async (req, res, next) => {
  const token = req.cookies.refreshToken;
  if (!token) return next(createCustomError("Refresh token not found", 401));

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    return next(createCustomError("Invalid or expired refresh token", 403));
  }

  const user = await User.findById(decoded.userId);
  if (!user) return next(createCustomError("User not found", 404));
  if (!user.refreshTokenHash) {
    // no stored hash → invalid or logged out
    return next(createCustomError("Invalid refresh token", 403));
  }

  // Compare raw token with stored hash
  const match = await bcrypt.compare(token, user.refreshTokenHash);
  if (!match) {
    // possible token reuse / theft - clear server-side stored hash to force re-login
    user.refreshTokenHash = null;
    await user.save();
    return next(createCustomError("Invalid refresh token", 403));
  }

  // At this point token is valid -> issue new access token and rotate refresh token
  const newAccessToken = createAccessToken(user._id);
  const newRefreshToken = createRefreshToken(user._id);

  // save new hashed refresh token
  user.refreshTokenHash = await bcrypt.hash(newRefreshToken, 10);
  await user.save();

  // set cookie with new refresh token (rotate)
  res.cookie("refreshToken", newRefreshToken, refreshCookieOptions);

  res.status(200).json({ accessToken: newAccessToken });
});

// ======= LOGOUT =======
const logout = asyncWrapper(async (req, res) => {
  const token = req.cookies.refreshToken;

  // clear cookie on client
  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });

  // if token exists, try to clear server stored hash (best-effort)
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      const user = await User.findById(decoded.userId);
      if (user) {
        user.refreshTokenHash = null;
        await user.save();
      }
    } catch (err) {
      // ignore verification errors; cookie already cleared
    }
  }

  res.status(200).json({ msg: "Logged out successfully" });
});

module.exports = { signup, login, refresh, logout };
