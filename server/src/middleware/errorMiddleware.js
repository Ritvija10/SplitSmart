export const notFound = (req, res, next) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
};

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Something went wrong";

  // Duplicate key (e.g. two signups with the same email at the same instant)
  if (err.code === 11000) {
    statusCode = 409;
    message = "An account with this email already exists";
  }

  if (statusCode === 500) console.error(err);

  res.status(statusCode).json({ message });
};