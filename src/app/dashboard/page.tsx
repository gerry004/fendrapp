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
  isHarmful?: boolean;
  analyzing?: boolean;
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Redirect to home if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Add session refresh on dashboard load
  useEffect(() => {
    const refreshSessionData = async () => {
      try {
        const response = await fetch('/api/auth/session');
        if (!response.ok) {
          console.error('Failed to refresh session');
        }
      } catch (error) {
        console.error('Error refreshing session:', error);
      }
    };
    
    if (user) {
      refreshSessionData();
    }
  }, [user]);

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

    } catch (error) {
      console.error('Error fetching comments:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Analyze a specific comment
  const analyzeComment = async (commentId: string, commentText: string) => {
    try {
      // Update the comment's analyzing state
      setComments(prevComments => 
        prevComments.map(c => 
          c.id === commentId ? { ...c, analyzing: true } : c
        )
      );
      
      const response = await fetch('/api/data/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment: commentText }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze comment');
      }
      
      // Update the comment with the analysis result
      setComments(prevComments => 
        prevComments.map(c => 
          c.id === commentId ? { ...c, isHarmful: data.isHarmful, analyzing: false } : c
        )
      );
    } catch (error) {
      console.error('Error analyzing comment:', error);
      
      // Reset the analyzing state on error
      setComments(prevComments => 
        prevComments.map(c => 
          c.id === commentId ? { ...c, analyzing: false } : c
        )
      );
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
      
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Instagram Comments</h2>
        <a
          href="/onboard"
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Change moderation settings
        </a>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
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
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500">Media ID: {comment.mediaId || 'Unknown'}</span>
                        <div className="flex items-center gap-2">
                          <span className={`${comment.hidden ? 'text-red-500' : 'text-green-500'}`}>
                            {comment.hidden ? 'Hidden' : 'Visible'}
                          </span>
                          
                          {comment.isHarmful !== undefined && (
                            <span className={`px-2 py-1 rounded ${comment.isHarmful ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                              {comment.isHarmful ? 'Harmful' : 'Safe'}
                            </span>
                          )}
                          
                          <button
                            onClick={() => analyzeComment(comment.id, comment.text)}
                            disabled={comment.analyzing}
                            className={`px-3 py-1 rounded text-xs font-medium ${
                              comment.analyzing 
                                ? 'bg-gray-200 text-gray-500' 
                                : 'bg-blue-500 text-white hover:bg-blue-600'
                            }`}
                          >
                            {comment.analyzing ? 'Analyzing...' : 'Analyze'}
                          </button>
                        </div>
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