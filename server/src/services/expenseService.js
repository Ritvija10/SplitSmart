import mongoose from "mongoose";
import Expense, { CATEGORIES } from "../models/Expense.js";
import AppError from "../utils/AppError.js";
import { splitEqually } from "../utils/money.js";
import { getGroupForMember } from "./groupService.js";

const populate = (query) =>
  query
    .populate("paidBy", "name email")
    .populate("splits.user", "name email")
    .populate("createdBy", "name email");

const memberIdSet = (group) =>
  new Set(group.members.map((m) => m._id.toString()));

// Validates the request body and returns clean data ready to save
const prepareExpenseData = (body = {}, memberIds) => {
  const { description, amount, category, paidBy, splitType, date } = body;

  if (!description || !String(description).trim()) {
    throw new AppError("Description is required", 400);
  }
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new AppError("Amount must be a positive whole number of paise", 400);
  }
  if (category && !CATEGORIES.includes(category)) {
    throw new AppError("Invalid category", 400);
  }
  if (!memberIds.has(String(paidBy))) {
    throw new AppError("The payer must be a member of the group", 400);
  }

  let splits;

  if (splitType === "equal") {
    const { participants } = body;
    if (!Array.isArray(participants) || participants.length === 0) {
      throw new AppError("Choose at least one participant", 400);
    }
    const ids = participants.map(String);
    if (new Set(ids).size !== ids.length) {
      throw new AppError("Participants must be unique", 400);
    }
    if (!ids.every((id) => memberIds.has(id))) {
      throw new AppError("All participants must be group members", 400);
    }
    splits = splitEqually(amount, ids);
  } else if (splitType === "custom") {
    const { splits: customSplits } = body;
    if (!Array.isArray(customSplits) || customSplits.length === 0) {
      throw new AppError("Provide the split amounts", 400);
    }
    const ids = customSplits.map((s) => String(s.user));
    if (new Set(ids).size !== ids.length) {
      throw new AppError("Each person can appear only once in a split", 400);
    }
    if (!ids.every((id) => memberIds.has(id))) {
      throw new AppError("All split users must be group members", 400);
    }
    if (!customSplits.every((s) => Number.isInteger(s.amount) && s.amount > 0)) {
      throw new AppError("Each split must be a positive whole number of paise", 400);
    }
    const total = customSplits.reduce((sum, s) => sum + s.amount, 0);
    if (total !== amount) {
      throw new AppError(
        `Split amounts add up to ${total} paise but the expense is ${amount} paise`,
        400
      );
    }
    splits = customSplits.map((s) => ({ user: String(s.user), amount: s.amount }));
  } else {
    throw new AppError("Split type must be 'equal' or 'custom'", 400);
  }

  const data = {
    description: String(description).trim(),
    amount,
    category: category || "other",
    paidBy,
    splitType,
    splits,
  };

  if (date) {
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) {
      throw new AppError("Invalid date", 400);
    }
    data.date = parsed;
  }
  return data;
};

const loadExpense = async (groupId, expenseId) => {
  if (!mongoose.isValidObjectId(expenseId)) {
    throw new AppError("Invalid expense id", 400);
  }
  const expense = await Expense.findOne({ _id: expenseId, group: groupId });
  if (!expense) throw new AppError("Expense not found", 404);
  return expense;
};

// Only the person who added the expense, or the group creator, may change it
const assertCanModify = (expense, group, userId) => {
  const isOwner = expense.createdBy.toString() === userId.toString();
  const isGroupCreator = group.createdBy._id.toString() === userId.toString();
  if (!isOwner && !isGroupCreator) {
    throw new AppError("You can only change expenses you added", 403);
  }
};

export const createExpense = async ({ groupId, userId, body }) => {
  const group = await getGroupForMember(groupId, userId);
  const data = prepareExpenseData(body, memberIdSet(group));

  const expense = await Expense.create({
    ...data,
    group: groupId,
    createdBy: userId,
  });
  return populate(Expense.findById(expense._id));
};

export const listExpenses = async ({ groupId, userId }) => {
  await getGroupForMember(groupId, userId);
  return populate(Expense.find({ group: groupId }).sort({ date: -1, createdAt: -1 }));
};

export const updateExpense = async ({ groupId, expenseId, userId, body }) => {
  const group = await getGroupForMember(groupId, userId);
  const expense = await loadExpense(groupId, expenseId);
  assertCanModify(expense, group, userId);

  const data = prepareExpenseData(body, memberIdSet(group));
  Object.assign(expense, data);
  await expense.save();

  return populate(Expense.findById(expense._id));
};

export const deleteExpense = async ({ groupId, expenseId, userId }) => {
  const group = await getGroupForMember(groupId, userId);
  const expense = await loadExpense(groupId, expenseId);
  assertCanModify(expense, group, userId);
  await expense.deleteOne();
};