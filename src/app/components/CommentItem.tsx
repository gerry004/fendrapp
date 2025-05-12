'use client';

import { useState } from 'react';
import CommentActions from './CommentActions';

interface CommentItemProps {
  id: string;
  username: string;
  text: string;
  accessToken: string;
  isHarmful?: boolean;
  hidden?: boolean;
  onStatusChange?: (commentId: string, status: { hidden?: boolean; deleted?: boolean }) => void;
}

export default function CommentItem({ 
  id, 
  username, 
  text, 
  accessToken,
  isHarmful, 
  hidden = false,
  onStatusChange
}: CommentItemProps) {
  const [status, setStatus] = useState({
    hidden: hidden,
    deleted: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Handle completion of a comment action
  const handleActionComplete = (action: 'hide' | 'unhide' | 'delete', success: boolean) => {
    if (!success) return;
    
    if (action === 'delete') {
      setStatus(prev => ({ ...prev, deleted: true }));
      onStatusChange?.(id, { deleted: true });
    } else if (action === 'hide') {
      setStatus(prev => ({ ...prev, hidden: true }));
      onStatusChange?.(id, { hidden: true });
    } else if (action === 'unhide') {
      setStatus(prev => ({ ...prev, hidden: false }));
      onStatusChange?.(id, { hidden: false });
    }
  };

  // Determine status label and style
  const getStatusInfo = () => {
    if (status.deleted) {
      return { label: 'Deleted', className: 'bg-red-100 text-red-600' };
    }
    
    if (status.hidden) {
      return { label: 'Hidden', className: 'bg-yellow-100 text-yellow-600' };
    }
    
    if (isHarmful === true) {
      return { label: 'Harmful', className: 'bg-orange-100 text-orange-600' };
    }
    
    if (isHarmful === false) {
      return { label: 'Safe', className: 'bg-green-100 text-green-600' };
    }
    
    return { label: 'Pending', className: 'bg-gray-100 text-gray-600' };
  };

  const statusInfo = getStatusInfo();

  // Don't display deleted comments
  if (status.deleted) {
    return null;
  }

  return (
    <div className="flex items-start p-4 bg-white rounded-xl mb-3 shadow-sm border border-gray-50 hover:shadow-md transition-shadow duration-200">
      <div className="flex-shrink-0 mr-3">
        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-medium overflow-hidden">
          {username.charAt(0).toUpperCase()}
        </div>
      </div>
      
      <div className="flex-grow">
        <div className="flex items-center justify-between mb-1">
          <div className="font-medium text-gray-800">{username}</div>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.className}`}>
              {statusInfo.label}
            </span>
            <CommentActions
              commentId={id}
              accessToken={accessToken}
              hidden={status.hidden}
              onActionComplete={handleActionComplete}
            />
          </div>
        </div>
        <div className="text-gray-700 text-sm">{text}</div>
      </div>
    </div>
  );
} 