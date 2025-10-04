const User = require("../models/user.model");
const { generateToken } = require("../utils/jwt");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appError");

exports.signup = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body || {};
  const trimmedName = name?.trim();
  const normalizedEmail = email?.trim().toLowerCase();

  if (!trimmedName || !normalizedEmail || !password) {
    return next(new AppError("Name, email, and password are required", 400));
  }

  if (password.length < 6) {
    return next(new AppError("Password must be at least 6 characters", 400));
  }

  const exists = await User.findOne({ email: normalizedEmail });
  if (exists) {
    return next(new AppError("Email already in use", 400));
  }

  const user = await User.create({
    name: trimmedName,
    email: normalizedEmail,
    password,
  });
  const { password: _password, ...userData } = user.toObject();
  res.status(201).json({ token: generateToken(user), user: userData });
});

exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body || {};
  const normalizedEmail = email?.trim().toLowerCase();

  if (!normalizedEmail || !password) {
    return next(new AppError("Email and password are required", 400));
  }

  const user = await User.findOne({ email: normalizedEmail }).select(
    "+password"
  );
  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError("Invalid credentials", 401));
  }

  const { password: _password, ...userData } = user.toObject();
  res.json({ token: generateToken(user), user: userData });
});
