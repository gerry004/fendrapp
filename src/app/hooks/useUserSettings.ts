import { useState, useEffect } from 'react';
import { useUser } from './useUser';

type ModerationOption = 'AUTO_DELETE' | 'AUTO_HIDE' | 'MANUAL_REVIEW';

export function useUserSettings() {
  const { userData } = useUser();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localSettings, setLocalSettings] = useState<ModerationOption | null | undefined>(userData?.settings);

  // Update local settings when userData changes
  useEffect(() => {
    if (userData?.settings !== undefined && userData?.settings !== localSettings) {
      setLocalSettings(userData?.settings);
    }
  }, [userData?.settings]);

  const updateSettings = async (settings: ModerationOption) => {
    setIsUpdating(true);
    setError(null);
    
    try {
      const response = await fetch('/api/user/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update settings');
      }

      // Update local state immediately for better UX
      setLocalSettings(settings);
      
      // Wait for a short time before clearing loading state
      setTimeout(() => {
        setIsUpdating(false);
      }, 500);

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setIsUpdating(false);
      return false;
    }
  };

  return {
    currentSettings: localSettings,
    updateSettings,
    isUpdating,
    error
  };
} 