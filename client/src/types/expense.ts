import type { Member } from "./group";

export const CATEGORIES = [
  "food",
  "transport",
  "stay",
  "shopping",
  "entertainment",
  "utilities",
  "other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface ExpenseSplit {
  user: Member;
  amount: number; // paise
}

export interface Expense {
  _id: string;
  group: string;
  description: string;
  amount: number; // paise
  category: Category;
  paidBy: Member;
  splitType: "equal" | "custom";
  splits: ExpenseSplit[];
  date: string;
  createdBy: Member;
  createdAt: string;
}

export interface ExpensePayload {
  description: string;
  amount: number;
  category: Category;
  paidBy: string;
  splitType: "equal" | "custom";
  participants?: string[];
  splits?: { user: string; amount: number }[];
}