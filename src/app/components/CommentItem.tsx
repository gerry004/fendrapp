'use client';

interface CommentItemProps {
  username: string;
  text: string;
  isHarmful?: boolean;
  hidden?: boolean;
}

export default function CommentItem({ username, text, isHarmful, hidden }: CommentItemProps) {
  // Determine status label and style
  const getStatusInfo = () => {
    if (hidden) {
      return { label: 'Hidden', className: 'bg-red-100 text-red-600' };
    }
    
    if (isHarmful === true) {
      return { label: 'Deleted', className: 'bg-red-100 text-red-600' };
    }
    
    if (isHarmful === false) {
      return { label: 'Visible', className: 'bg-green-100 text-green-600' };
    }
    
    // Default to match image
    return { label: 'Deleted', className: 'bg-red-100 text-red-600' };
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="flex items-start p-4 bg-white rounded-xl mb-3 shadow-sm border border-gray-50 hover:shadow-md transition-shadow duration-200">
      <div className="flex-shrink-0 mr-3">
        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-medium overflow-hidden">
          {username.charAt(0).toUpperCase()}
        </div>
      </div>
      
      <div className="flex-grow">
        <div className="font-medium text-gray-800 mb-1">{username}</div>
        <div className="text-gray-700 text-sm">{text}</div>
      </div>
      
      <div className="ml-3 flex-shrink-0">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.className}`}>
          {statusInfo.label}
        </span>
      </div>
    </div>
  );
} 