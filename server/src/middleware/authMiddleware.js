import jwt from "jsonwebtoken";
import User from "../models/user.js";
import AppError from "../utils/AppError.js";

export const protect = async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    throw new AppError("Not authorized, no token", 401);
  }

  const token = header.split(" ")[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new AppError("Not authorized, invalid or expired token", 401);
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    throw new AppError("Not authorized, user no longer exists", 401);
  }

  req.user = user;
  next();
};