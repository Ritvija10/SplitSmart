import mongoose from "mongoose";

export const CATEGORIES = [
  "food",
  "transport",
  "stay",
  "shopping",
  "entertainment",
  "utilities",
  "other",
];

const splitSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: { type: Number, required: true, min: 0 }, // paise
  },
  { _id: false }
);

const expenseSchema = new mongoose.Schema(
  {
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    description: { type: String, required: true, trim: true, maxlength: 100 },
    amount: {
      type: Number,
      required: true,
      min: 1,
      validate: { validator: Number.isInteger, message: "Amount must be paise" },
    },
    category: { type: String, enum: CATEGORIES, default: "other" },
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    splitType: { type: String, enum: ["equal", "custom"], required: true },
    splits: { type: [splitSchema], required: true },
    date: { type: Date, default: Date.now },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

expenseSchema.index({ group: 1, date: -1 });

export default mongoose.model("Expense", expenseSchema);