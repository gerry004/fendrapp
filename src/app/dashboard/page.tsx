'use client';

import UserProfile from '../components/UserProfile';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Comment {
  text: string;
  username: string;
  hidden: boolean;
  id: string;
  mediaId?: string;
  timestamp?: string;
}

interface Page {
  id: string;
  name: string;
  instagram_business_account_id: string | null;
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Redirect to home if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Fetch comments when the page loads
  useEffect(() => {
    if (user) {
      fetchComments();
    }
  }, [user]);

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/data/comments');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch comments');
      }
      
      setComments(data.comments || []);
      setPages(data.pages || []);
      
      console.log('Comments data:', data);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Format timestamp to a readable date
  const formatDate = (timestamp?: string) => {
    if (!timestamp) return 'Unknown date';
    return new Date(timestamp).toLocaleString();
  };

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
      <div className="mb-6">
        <UserProfile />
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Connected Pages</h2>
        {isLoading && <p>Loading pages...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!isLoading && !error && (
          <div>
            {pages.length === 0 ? (
              <p>No Facebook pages with Instagram accounts found.</p>
            ) : (
              <ul className="space-y-2">
                {pages.map(page => (
                  <li key={page.id} className="p-3 bg-gray-50 rounded">
                    <p className="font-medium">{page.name}</p>
                    <p className="text-sm text-gray-600">
                      {page.instagram_business_account_id 
                        ? `Instagram ID: ${page.instagram_business_account_id}`
                        : 'No Instagram account connected'}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Instagram Comments</h2>
        {isLoading && <p>Loading comments...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!isLoading && !error && (
          <div>
            {comments.length === 0 ? (
              <p>No comments found.</p>
            ) : (
              <div>
                <p className="mb-4 text-sm text-gray-600">
                  Showing {comments.length} comments from your Instagram account(s)
                </p>
                <ul className="space-y-4">
                  {comments.map(comment => (
                    <li key={comment.id} className="p-4 border border-gray-200 rounded">
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">@{comment.username}</span>
                        <span className="text-sm text-gray-500">{formatDate(comment.timestamp)}</span>
                      </div>
                      <p className="mb-2">{comment.text}</p>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Media ID: {comment.mediaId || 'Unknown'}</span>
                        <span>{comment.hidden ? 'Hidden' : 'Visible'}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 