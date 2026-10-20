import bcrypt from "bcrypt";
import User from "../models/user.js";
import AppError from "../utils/AppError.js";
import generateToken from "../utils/generateToken.js";

const toPublicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
});

export const registerUser = async ({ name, email, password }) => {
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new AppError("An account with this email already exists", 409);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashedPassword });

  return { user: toPublicUser(user), token: generateToken(user._id) };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+password"
  );

  // Same message for both failures so attackers can't tell which emails exist
  const invalid = new AppError("Invalid email or password", 401);
  if (!user) throw invalid;

  const matches = await bcrypt.compare(password, user.password);
  if (!matches) throw invalid;

  return { user: toPublicUser(user), token: generateToken(user._id) };
};