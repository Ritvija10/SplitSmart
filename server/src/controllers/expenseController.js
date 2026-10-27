import * as expenseService from "../services/expenseService.js";

export const createExpense = async (req, res) => {
  const expense = await expenseService.createExpense({
    groupId: req.params.groupId,
    userId: req.user._id,
    body: req.body,
  });
  res.status(201).json({ expense });
};

export const listExpenses = async (req, res) => {
  const expenses = await expenseService.listExpenses({
    groupId: req.params.groupId,
    userId: req.user._id,
  });
  res.json({ expenses });
};

export const updateExpense = async (req, res) => {
  const expense = await expenseService.updateExpense({
    groupId: req.params.groupId,
    expenseId: req.params.expenseId,
    userId: req.user._id,
    body: req.body,
  });
  res.json({ expense });
};

export const deleteExpense = async (req, res) => {
  await expenseService.deleteExpense({
    groupId: req.params.groupId,
    expenseId: req.params.expenseId,
    userId: req.user._id,
  });
  res.json({ message: "Expense deleted" });
};