import { apiRequest } from "./api";
import type { Expense, ExpensePayload } from "../types/expense";

export const listExpensesRequest = (groupId: string) =>
  apiRequest<{ expenses: Expense[] }>(`/groups/${groupId}/expenses`);

export const createExpenseRequest = (groupId: string, payload: ExpensePayload) =>
  apiRequest<{ expense: Expense }>(`/groups/${groupId}/expenses`, {
    method: "POST",
    body: payload,
  });

export const updateExpenseRequest = (
  groupId: string,
  expenseId: string,
  payload: ExpensePayload
) =>
  apiRequest<{ expense: Expense }>(`/groups/${groupId}/expenses/${expenseId}`, {
    method: "PUT",
    body: payload,
  });

export const deleteExpenseRequest = (groupId: string, expenseId: string) =>
  apiRequest<{ message: string }>(`/groups/${groupId}/expenses/${expenseId}`, {
    method: "DELETE",
  });