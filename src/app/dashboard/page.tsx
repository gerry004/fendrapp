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

type TabType = 'all' | 'safe' | 'harmful';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('all');
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
      
      const response = await fetch('/api/data');
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

  // Filter comments based on active tab
  const filteredComments = comments.filter(comment => {
    if (activeTab === 'all') return true;
    if (activeTab === 'safe') return comment.isHarmful === false;
    if (activeTab === 'harmful') return comment.isHarmful === true;
    return true;
  });

  // Stats for the tabs
  const safeCount = comments.filter(c => c.isHarmful === false).length;
  const harmfulCount = comments.filter(c => c.isHarmful === true).length;
  const pendingCount = comments.filter(c => c.isHarmful === undefined).length;

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
                  Total: {comments.length} comments • Safe: {safeCount} • Harmful: {harmfulCount} 
                  {pendingCount > 0 && ` • Pending Analysis: ${pendingCount}`}
                </p>
                
                {/* Tabs */}
                <div className="border-b border-gray-200 mb-4">
                  <nav className="flex -mb-px">
                    <button
                      onClick={() => setActiveTab('all')}
                      className={`mr-8 py-2 px-1 ${
                        activeTab === 'all'
                          ? 'border-b-2 border-blue-500 text-blue-600'
                          : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      All ({comments.length})
                    </button>
                    <button
                      onClick={() => setActiveTab('safe')}
                      className={`mr-8 py-2 px-1 ${
                        activeTab === 'safe'
                          ? 'border-b-2 border-green-500 text-green-600'
                          : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Safe ({safeCount})
                    </button>
                    <button
                      onClick={() => setActiveTab('harmful')}
                      className={`py-2 px-1 ${
                        activeTab === 'harmful'
                          ? 'border-b-2 border-red-500 text-red-600'
                          : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Harmful ({harmfulCount})
                    </button>
                  </nav>
                </div>
                
                {/* Comments list */}
                {filteredComments.length === 0 ? (
                  <p className="text-gray-500 py-4">No {activeTab === 'safe' ? 'safe' : activeTab === 'harmful' ? 'harmful' : ''} comments found.</p>
                ) : (
                  <ul className="space-y-4">
                    {filteredComments.map(comment => (
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
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 