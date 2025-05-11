'use client';

import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

// Helper function to format settings into readable text
const formatSettings = (settings?: string | null) => {
  if (settings === undefined || settings === null) return 'Not configured';
  
  switch (settings) {
    case 'AUTO_DELETE':
      return 'Auto delete hateful comments';
    case 'AUTO_HIDE':
      return 'Auto hide abusive comments';
    case 'MANUAL_REVIEW':
      return 'Manual review of comments';
    default:
      return 'Not configured';
  }
};

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
      <div className="mb-2">
        <strong>Comment Moderation:</strong> {formatSettings(user.settings)}
        {(user.settings === undefined || user.settings === null) && (
          <a href="/onboard" className="ml-2 text-blue-600 hover:text-blue-800 text-sm">
            Configure
          </a>
        )}
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