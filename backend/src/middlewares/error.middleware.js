const AppError = require("../utils/appError");

const formatMongooseError = (err) => {
  if (err.name === "CastError") {
    return new AppError("Resource not found", 404);
  }

  if (err.code === 11000) {
    const fields = Object.keys(err.keyValue || {});
    const message = fields.length
      ? `Duplicate value for field${
          fields.length > 1 ? "s" : ""
        }: ${fields.join(", ")}`
      : "Duplicate field value entered";
    return new AppError(message, 400);
  }

  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    return new AppError(message, 400);
  }

  return null;
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  console.error(err);

  const mappedError = formatMongooseError(err);
  const appError =
    mappedError ||
    (err instanceof AppError
      ? err
      : new AppError(err.message || "Internal Server Error", err.statusCode));

  const statusCode = appError.statusCode || 500;

  const response = {
    success: false,
    message: appError.message,
  };

  if (process.env.NODE_ENV !== "production") {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
