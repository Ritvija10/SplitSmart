import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  createGroupRequest,
  listGroupsRequest,
} from "../services/groupService";
import type { Group } from "../types/group";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    listGroupsRequest()
      .then((res) => setGroups(res.groups))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load groups")
      )
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setCreating(true);
    try {
      const res = await createGroupRequest(name, description);
      navigate(`/groups/${res.group._id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create group");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-emerald-600">
            Welcome, {user?.name}
          </h1>
          <button
            onClick={logout}
            className="border px-4 py-2 rounded-lg hover:bg-gray-100"
          >
            Log out
          </button>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <form
          onSubmit={handleCreate}
          className="bg-white p-6 rounded-xl shadow space-y-3"
        >
          <h2 className="text-lg font-semibold">Create a group</h2>
          <input
            type="text"
            placeholder="Group name (e.g. Goa Trip)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
            className="w-full border rounded-lg px-3 py-2"
            required
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={200}
            className="w-full border rounded-lg px-3 py-2"
          />
          <button
            type="submit"
            disabled={creating}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
          >
            {creating ? "Creating..." : "Create group"}
          </button>
        </form>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Your groups</h2>

          {loading && <p className="text-gray-500">Loading groups...</p>}

          {!loading && groups.length === 0 && (
            <p className="text-gray-500">
              You're not in any groups yet. Create one above.
            </p>
          )}

          {groups.map((group) => (
            <Link
              key={group._id}
              to={`/groups/${group._id}`}
              className="block bg-white p-4 rounded-xl shadow hover:shadow-md transition"
            >
              <p className="font-semibold">{group.name}</p>
              {group.description && (
                <p className="text-sm text-gray-600">{group.description}</p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                {group.members.length}{" "}
                {group.members.length === 1 ? "member" : "members"}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}