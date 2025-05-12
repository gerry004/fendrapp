'use client';

import Navbar from '../components/Navbar';
import StatusCard from '../components/StatusCard';
import CommentItem from '../components/CommentItem';
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

type FilterTabType = 'positive' | 'negative';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
  const [activeTab, setActiveTab] = useState<FilterTabType>('positive');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastAnalyzedAt, setLastAnalyzedAt] = useState<string | null>(null);
  
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
      // Clear the timestamp while loading to show loading state
      setLastAnalyzedAt(null);
      
      const response = await fetch('/api/data');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch comments');
      }
      
      setComments(data.comments || []);
      
      // Only set the timestamp after data is successfully fetched
      setLastAnalyzedAt(new Date().toISOString());

    } catch (error) {
      console.error('Error fetching comments:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter comments based on active tab
  const filteredComments = comments.filter(comment => {
    if (activeTab === 'positive') return comment.isHarmful === false;
    if (activeTab === 'negative') return comment.isHarmful === true;
    return true;
  });

  // Handle tab change from StatusCard
  const handleTabChange = (tab: FilterTabType) => {
    setActiveTab(tab);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-purple-50">
        <div className="text-xl text-purple-700">Loading...</div>
      </div>
    );
  }
  
  if (!user) {
    return null; // Will redirect in the useEffect
  }

  // Clean, modern UI layout
  return (
    <div className="flex flex-col min-h-screen bg-purple-50/30">
      <Navbar />
      
      <div className="container mx-auto px-4 py-6 flex-grow max-w-3xl">
        <StatusCard 
          lastAnalyzedAt={lastAnalyzedAt} 
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

        {isLoading && (
          <div className="flex justify-center py-8">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
              <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse delay-150"></div>
              <div className="w-3 h-3 bg-purple-300 rounded-full animate-pulse delay-300"></div>
              <span className="text-purple-700 ml-2">Loading comments...</span>
            </div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 p-4 rounded-xl mb-4 shadow-sm border border-red-100">
            <p className="text-red-600">{error}</p>
          </div>
        )}
        
        {!isLoading && !error && (
          <>
            {filteredComments.length === 0 ? (
              <div className="bg-white p-6 rounded-xl shadow-sm text-center border border-gray-100">
                <p className="text-gray-600">No {activeTab === 'positive' ? 'safe' : 'harmful'} comments found.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredComments.map(comment => (
                  <CommentItem 
                    key={comment.id}
                    username={comment.username}
                    text={comment.text}
                    isHarmful={comment.isHarmful}
                    hidden={comment.hidden}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 