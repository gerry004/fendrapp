'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';

type ModerationOption = 'AUTO_DELETE' | 'AUTO_HIDE' | 'MANUAL_REVIEW';

export default function OnboardPage() {
  const { user, loading, refreshSession } = useAuth();
  const [selectedOption, setSelectedOption] = useState<ModerationOption | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();
  
  // Redirect to home if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
    
    // Set the initial selection based on user's current setting
    if (user?.settings) {
      setSelectedOption(user.settings as ModerationOption);
      setIsUpdating(true);
    }
  }, [user, loading, router]);

  const handleSelectOption = async (option: ModerationOption) => {
    setSelectedOption(option);
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/user/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings: option }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save settings');
      }
      
      // Refresh session to get updated settings
      await refreshSession();
      
      // Redirect to dashboard after saving
      router.push('/dashboard');
    } catch (error) {
      console.error('Error saving settings:', error);
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in the useEffect
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-white">
      <div className="max-w-md w-full px-6 py-8 rounded-xl">
        <h1 className="text-center text-xl font-medium mb-8">
          How would you like us to manage hateful comments?
        </h1>

        {isUpdating && (
          <div className="mb-4 flex justify-end">
            <Link 
              href="/dashboard" 
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Back to dashboard
            </Link>
          </div>
        )}

        <div className="space-y-4">
          {/* Auto delete option */}
          <button
            onClick={() => handleSelectOption('AUTO_DELETE')}
            disabled={isSubmitting}
            className={`w-full py-4 px-6 text-center bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors ${
              selectedOption === 'AUTO_DELETE' ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            <div className="font-medium">Auto delete</div>
            <p className="text-sm text-gray-600 mt-1 text-left">
              We'll automatically <span className="font-semibold">delete</span> any comments identified as hateful
            </p>
          </button>

          {/* Auto hide option */}
          <button
            onClick={() => handleSelectOption('AUTO_HIDE')}
            disabled={isSubmitting}
            className={`w-full py-4 px-6 text-center bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors ${
              selectedOption === 'AUTO_HIDE' ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            <div className="font-medium">Auto hide</div>
            <p className="text-sm text-gray-600 mt-1 text-left">
              We'll automatically <span className="font-semibold">hide</span> any comments flagged as abusive. This means they will be hidden from public view until you review them, by either deleting or restoring the comment
            </p>
          </button>

          {/* Manual review option */}
          <button
            onClick={() => handleSelectOption('MANUAL_REVIEW')}
            disabled={isSubmitting}
            className={`w-full py-4 px-6 text-center bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors ${
              selectedOption === 'MANUAL_REVIEW' ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            <div className="font-medium">Manual review</div>
            <p className="text-sm text-gray-600 mt-1 text-left">
              We will separate comments into positive and negative for you to review
            </p>
          </button>
        </div>

        {isSubmitting && (
          <div className="mt-4 text-center text-gray-500">
            <div className="inline-block w-5 h-5 mr-2 border-t-2 border-blue-500 rounded-full animate-spin"></div>
            {isUpdating ? 'Updating' : 'Saving'} your preference...
          </div>
        )}
      </div>
    </div>
  );
}
