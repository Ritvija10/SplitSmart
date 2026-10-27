
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  addMemberRequest,
  getGroupRequest,
  removeMemberRequest,
} from "../services/groupService";
import type { Group, Member } from "../types/group";
import ExpenseSection from "../components/ExpenseSection";

export default function GroupDetails() {
  const { groupId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [email, setEmail] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!groupId) return;
    getGroupRequest(groupId)
      .then((res) => setGroup(res.group))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load group")
      )
      .finally(() => setLoading(false));
  }, [groupId]);

  if (loading) {
    return <p className="p-8 text-center text-gray-500">Loading...</p>;
  }

  if (!group || !groupId) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-red-600">{error || "Group not found"}</p>
        <Link to="/" className="text-emerald-600 underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const creator = group.createdBy as Member;
  const isCreator = creator._id === user?.id;

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setAdding(true);
    try {
      const res = await addMemberRequest(groupId, email);
      setGroup(res.group);
      setEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add member");
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (memberId: string) => {
    setError("");
    const leaving = memberId === user?.id;
    if (!window.confirm(leaving ? "Leave this group?" : "Remove this member?")) {
      return;
    }
    try {
      const res = await removeMemberRequest(groupId, memberId);
      if (leaving || !res.group) {
        navigate("/");
      } else {
        setGroup(res.group);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove member");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Link to="/" className="text-sm text-emerald-600 underline">
          ← Back to dashboard
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-emerald-600">{group.name}</h1>
          {group.description && (
            <p className="text-gray-600">{group.description}</p>
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="bg-white p-6 rounded-xl shadow space-y-3">
          <h2 className="text-lg font-semibold">
            Members ({group.members.length})
          </h2>

          <ul className="divide-y">
            {group.members.map((member) => {
              const isGroupCreator = member._id === creator._id;
              const isMe = member._id === user?.id;
              const canRemove = !isGroupCreator && (isCreator || isMe);

              return (
                <li
                  key={member._id}
                  className="flex items-center justify-between py-2"
                >
                  <div>
                    <p className="font-medium">
                      {member.name}
                      {isMe && " (you)"}
                      {isGroupCreator && (
                        <span className="ml-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                          creator
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-500">{member.email}</p>
                  </div>

                  {canRemove && (
                    <button
                      onClick={() => handleRemove(member._id)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      {isMe ? "Leave" : "Remove"}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <form
          onSubmit={handleAdd}
          className="bg-white p-6 rounded-xl shadow space-y-3"
        >
          <h2 className="text-lg font-semibold">Add a member</h2>
          
          <p className="text-sm text-gray-500">
            They need a SplitSmart account first. Enter the email they
            registered with.
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="friend@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 border rounded-lg px-3 py-2"
              required
            />
            <button
              type="submit"
              disabled={adding}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
            >
              {adding ? "Adding..." : "Add"}
            </button>
          </div>
        </form>
        <ExpenseSection group={group} />
      </div>
    </div>
  );
}