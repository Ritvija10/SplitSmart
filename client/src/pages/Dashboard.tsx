import { useAuth } from "../hooks/useAuth";

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
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
    </div>
  );
}