import { useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "../hooks/useAuth";
import type { Group } from "../types/group";
import { CATEGORIES } from "../types/expense";
import type { Category, Expense, ExpensePayload } from "../types/expense";
import { formatPaise, paiseToRupeeString, rupeesToPaise } from "../utils/money";

interface Props {
  group: Group;
  initial?: Expense;
  onSubmit: (payload: ExpensePayload) => Promise<void>;
  onCancel?: () => void;
}

export default function ExpenseForm({ group, initial, onSubmit, onCancel }: Props) {
  const { user } = useAuth();

  const [description, setDescription] = useState(initial?.description ?? "");
  const [amountStr, setAmountStr] = useState(
    initial ? paiseToRupeeString(initial.amount) : ""
  );
  const [category, setCategory] = useState<Category>(initial?.category ?? "other");
  const [paidBy, setPaidBy] = useState(initial?.paidBy._id ?? user?.id ?? "");
  const [splitType, setSplitType] = useState<"equal" | "custom">(
    initial?.splitType ?? "equal"
  );

  // Equal split: who takes part
  const [participants, setParticipants] = useState<string[]>(
    initial?.splitType === "equal"
      ? initial.splits.map((s) => s.user._id)
      : group.members.map((m) => m._id)
  );

  // Custom split: amount typed per person (in rupees)
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>(
    () => {
      const map: Record<string, string> = {};
      if (initial?.splitType === "custom") {
        initial.splits.forEach((s) => {
          map[s.user._id] = paiseToRupeeString(s.amount);
        });
      }
      return map;
    }
  );

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const amountPaise = rupeesToPaise(amountStr);
  const customTotal = Object.values(customAmounts).reduce(
    (sum, v) => sum + (rupeesToPaise(v) ?? 0),
    0
  );

  const toggleParticipant = (id: string) => {
    setParticipants((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!amountPaise || amountPaise <= 0) {
      setError("Enter a valid amount, like 450 or 450.50");
      return;
    }

    let payload: ExpensePayload;

    if (splitType === "equal") {
      if (participants.length === 0) {
        setError("Choose at least one person to split with");
        return;
      }
      payload = {
        description,
        amount: amountPaise,
        category,
        paidBy,
        splitType,
        participants,
      };
    } else {
      const splits = group.members
        .map((m) => ({
          user: m._id,
          amount: rupeesToPaise(customAmounts[m._id] ?? "") ?? 0,
        }))
        .filter((s) => s.amount > 0);

      if (splits.length === 0) {
        setError("Enter an amount for at least one person");
        return;
      }
      if (customTotal !== amountPaise) {
        setError(
          `Split amounts add up to ${formatPaise(customTotal)}, but the expense is ${formatPaise(amountPaise)}`
        );
        return;
      }
      payload = {
        description,
        amount: amountPaise,
        category,
        paidBy,
        splitType,
        splits,
      };
    }

    setSubmitting(true);
    try {
      await onSubmit(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save expense");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow space-y-4">
      <h2 className="text-lg font-semibold">
        {initial ? "Edit expense" : "Add an expense"}
      </h2>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <input
        type="text"
        placeholder="What was it for? (e.g. Dinner)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        maxLength={100}
        className="w-full border rounded-lg px-3 py-2"
        required
      />

      <div className="grid grid-cols-2 gap-3">
        <input
          type="text"
          inputMode="decimal"
          placeholder="Amount (₹)"
          value={amountStr}
          onChange={(e) => setAmountStr(e.target.value)}
          className="border rounded-lg px-3 py-2"
          required
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
          className="border rounded-lg px-3 py-2 capitalize"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-1">Paid by</label>
        <select
          value={paidBy}
          onChange={(e) => setPaidBy(e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
        >
          {group.members.map((m) => (
            <option key={m._id} value={m._id}>
              {m.name}
              {m._id === user?.id ? " (you)" : ""}
            </option>
          ))}
        </select>
      </div>

      <div>
        <p className="text-sm text-gray-600 mb-1">Split</p>
        <div className="flex gap-2 mb-3">
          {(["equal", "custom"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setSplitType(type)}
              className={`px-3 py-1 rounded-lg border text-sm ${
                splitType === type
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "hover:bg-gray-100"
              }`}
            >
              {type === "equal" ? "Equally" : "Custom amounts"}
            </button>
          ))}
        </div>

        {splitType === "equal" ? (
          <div className="space-y-2">
            {group.members.map((m) => (
              <label key={m._id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={participants.includes(m._id)}
                  onChange={() => toggleParticipant(m._id)}
                />
                {m.name}
              </label>
            ))}
            {amountPaise && participants.length > 0 && (
              <p className="text-xs text-gray-500">
                About {formatPaise(Math.floor(amountPaise / participants.length))}{" "}
                each
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {group.members.map((m) => (
              <div key={m._id} className="flex items-center gap-3">
                <span className="flex-1">{m.name}</span>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={customAmounts[m._id] ?? ""}
                  onChange={(e) =>
                    setCustomAmounts((prev) => ({
                      ...prev,
                      [m._id]: e.target.value,
                    }))
                  }
                  className="w-28 border rounded-lg px-3 py-1 text-right"
                />
              </div>
            ))}
            <p
              className={`text-xs ${
                amountPaise !== null && customTotal === amountPaise
                  ? "text-emerald-600"
                  : "text-gray-500"
              }`}
            >
              Entered {formatPaise(customTotal)}
              {amountPaise !== null && ` of ${formatPaise(amountPaise)}`}
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
        >
          {submitting ? "Saving..." : initial ? "Save changes" : "Add expense"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="border px-4 py-2 rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}