import { registerUser, loginUser } from "../services/authServices.js";

export const register = async (req, res) => {
  const { name, email, password } = req.body;
  const result = await registerUser({ name, email, password });
  res.status(201).json(result);
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const result = await loginUser({ email, password });
  res.json(result);
};

export const getMe = async (req, res) => {
  res.json({
    user: { id: req.user._id, name: req.user.name, email: req.user.email },
  });
};