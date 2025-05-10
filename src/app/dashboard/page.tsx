'use client';

import UserProfile from '../components/UserProfile';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  // Redirect to home if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }
  
  if (!user) {
    return null; // Will redirect in the useEffect
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="mb-6">
        <UserProfile />
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Welcome, {user.name}!</h2>
        <p>This is your dashboard. You are now logged in with Facebook.</p>
      </div>
    </div>
  );
} 