import AppError from "../utils/AppError.js";

export const validateCreateGroup = (req, res, next) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    throw new AppError("Group name is required", 400);
  }
  next();
};

export const validateAddMember = (req, res, next) => {
  const { email } = req.body;
  if (!email || !email.trim()) {
    throw new AppError("Member email is required", 400);
  }
  next();
};