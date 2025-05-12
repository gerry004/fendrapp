'use client';

import { useState } from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';

interface CommentActionsProps {
  commentId: string;
  accessToken: string;
  hidden: boolean;
  onActionComplete: (action: 'hide' | 'unhide' | 'delete', success: boolean) => void;
}

export default function CommentActions({ 
  commentId, 
  accessToken, 
  hidden, 
  onActionComplete 
}: CommentActionsProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleHideUnhide = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    const action = hidden ? 'unhide' : 'hide';
    const endpoint = `/api/comments/${action}`;
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ commentId, accessToken }),
      });
      
      const data = await response.json();
      
      console.log(`${action} comment response:`, data);
      
      if (!response.ok) {
        throw new Error(data.error || `Failed to ${action} comment`);
      }
      
      onActionComplete(action, true);
    } catch (error) {
      console.error(`Error ${action} comment:`, error);
      alert(`Failed to ${action} comment. Please check the console for details.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (isLoading) return;
    
    if (!confirm('Are you sure you want to permanently delete this comment?')) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const queryParams = new URLSearchParams({
        commentId,
        accessToken,
      }).toString();
      
      const response = await fetch(`/api/comments/delete?${queryParams}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      console.log('delete comment response:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete comment');
      }
      
      onActionComplete('delete', true);
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment. Please check the console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex space-x-2">
      <button
        type="button"
        onClick={handleHideUnhide}
        disabled={isLoading}
        className={`px-3 py-1 rounded-md text-xs font-medium ${
          hidden 
            ? 'bg-green-100 text-green-600 hover:bg-green-200' 
            : 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
        title={hidden ? 'Make comment visible' : 'Hide comment'}
      >
        {hidden ? 'Unhide' : 'Hide'}
      </button>
      
      <button
        type="button"
        onClick={handleDelete}
        disabled={isLoading}
        className="p-1 rounded-full text-red-500 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        title="Delete comment"
      >
        <TrashIcon className="h-5 w-5" />
      </button>
    </div>
  );
} 