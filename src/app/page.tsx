"use client"

import { useAuth } from './context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import UserProfile from './components/UserProfile';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleFacebookLogin = async () => {
    const res = await fetch('/api/connect_facebook');
    if (res.ok) {
      const data = await res.json();
      if (data.oauthUrl) {
        window.location.href = data.oauthUrl;
      }
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-6">
      <div className="max-w-md w-full">
        <h1 className="text-3xl font-bold mb-6 text-center">Fendr App</h1>
        <p className="mb-8 text-center text-gray-600">
          Hateful Comment Moderation for Instagram
        </p>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
          <UserProfile />
        </div>
        
        {!user && (
          <div className="text-center">
            <button
              onClick={handleFacebookLogin}
              className="bg-gradient-to-r from-blue-600 to-blue-400 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Connect with Facebook
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// https://www.instagram.com/oauth/authorize?client_id=704153072007594&redirect_uri=http://localhost:3000/api/instagram/callback/&response_type=code&scope=instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish