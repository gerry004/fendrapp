'use client';

import { useAuth } from '../context/AuthContext';

export default function UserProfile() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return (
      <div className="p-4 rounded-md bg-gray-100">
        <p>Not logged in</p>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-md bg-gray-100">
      <div className="mb-2">
        <strong>User ID:</strong> {user.userId}
      </div>
      <div className="mb-2">
        <strong>Name:</strong> {user.name}
      </div>
      <button
        onClick={logout}
        className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700"
      >
        Logout
      </button>
    </div>
  );
} 