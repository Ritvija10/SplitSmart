import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  createExpenseRequest,
  deleteExpenseRequest,
  listExpensesRequest,
  updateExpenseRequest,
} from "../services/expenseService";
import type { Group, Member } from "../types/group";
import type { Expense, ExpensePayload } from "../types/expense";
import { formatPaise } from "../utils/money";
import ExpenseForm from "./ExpenseForm";

export default function ExpenseSection({ group }: { group: Group }) {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);

  const groupCreator = group.createdBy as Member;

  useEffect(() => {
    listExpensesRequest(group._id)
      .then((res) => setExpenses(res.expenses))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load expenses")
      )
      .finally(() => setLoading(false));
  }, [group._id]);

  const canModify = (expense: Expense) =>
    expense.createdBy._id === user?.id || groupCreator._id === user?.id;

  const handleCreate = async (payload: ExpensePayload) => {
    const res = await createExpenseRequest(group._id, payload);
    setExpenses((prev) => [res.expense, ...prev]);
    setShowForm(false);
  };

  const handleUpdate = async (payload: ExpensePayload) => {
    if (!editing) return;
    const res = await updateExpenseRequest(group._id, editing._id, payload);
    setExpenses((prev) =>
      prev.map((e) => (e._id === res.expense._id ? res.expense : e))
    );
    setEditing(null);
  };

  const handleDelete = async (expense: Expense) => {
    if (!window.confirm(`Delete "${expense.description}"?`)) return;
    setError("");
    try {
      await deleteExpenseRequest(group._id, expense._id);
      setExpenses((prev) => prev.filter((e) => e._id !== expense._id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete expense");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Expenses</h2>
        {!showForm && !editing && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
          >
            Add expense
          </button>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {showForm && (
        <ExpenseForm
          key="new"
          group={group}
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editing && (
        <ExpenseForm
          key={editing._id}
          group={group}
          initial={editing}
          onSubmit={handleUpdate}
          onCancel={() => setEditing(null)}
        />
      )}

      {loading && <p className="text-gray-500">Loading expenses...</p>}

      {!loading && expenses.length === 0 && (
        <p className="text-gray-500">No expenses yet. Add the first one.</p>
      )}

      <ul className="space-y-3">
        {expenses.map((expense) => (
          <li key={expense._id} className="bg-white p-4 rounded-xl shadow">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{expense.description}</p>
                <p className="text-sm text-gray-500">
                  Paid by {expense.paidBy.name} ·{" "}
                  <span className="capitalize">{expense.category}</span> ·{" "}
                  {new Date(expense.date).toLocaleDateString()}
                </p>
              </div>
              <p className="font-semibold text-emerald-700">
                {formatPaise(expense.amount)}
              </p>
            </div>

            <ul className="mt-2 text-sm text-gray-600 space-y-0.5">
              {expense.splits.map((s) => (
                <li key={s.user._id} className="flex justify-between">
                  <span>{s.user.name}</span>
                  <span>{formatPaise(s.amount)}</span>
                </li>
              ))}
            </ul>

            {canModify(expense) && (
              <div className="mt-3 flex gap-4 text-sm">
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditing(expense);
                  }}
                  className="text-emerald-600 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(expense)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}