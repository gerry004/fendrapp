'use client';

import { useState, useRef, useEffect } from 'react';
import { useUserSettings } from '../hooks/useUserSettings';

type ModerationOption = 'AUTO_DELETE' | 'AUTO_HIDE' | 'MANUAL_REVIEW';

interface SettingsDropdownProps {
  isMobile?: boolean;
}

export default function SettingsDropdown({ isMobile = false }: SettingsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { currentSettings, updateSettings, isUpdating } = useUserSettings();
  const [displayedSetting, setDisplayedSetting] = useState<ModerationOption | null | undefined>(currentSettings);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Update displayed setting when currentSettings changes
  useEffect(() => {
    if (currentSettings !== displayedSetting) {
      setDisplayedSetting(currentSettings);
    }
  }, [currentSettings]);

  // Format the settings for display
  const formatSettings = (settings?: string | null) => {
    if (settings === undefined || settings === null) return 'Configure moderation';
    
    switch (settings) {
      case 'AUTO_DELETE':
        return 'Auto delete hateful comments';
      case 'AUTO_HIDE':
        return 'Auto hide abusive comments';
      case 'MANUAL_REVIEW':
        return 'Manual review of comments';
      default:
        return 'Configure moderation';
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = async (option: ModerationOption) => {
    await updateSettings(option);
    setIsOpen(false);
  };

  const mobileClasses = isMobile 
    ? "w-full bg-purple-700 text-white rounded-lg" 
    : "bg-purple-600 text-white rounded-lg";

  // Use a different style for unconfigured settings
  const buttonStyles = displayedSetting === undefined || displayedSetting === null
    ? `${mobileClasses} hover:bg-purple-800 border-2 border-white border-dashed`
    : `${mobileClasses} hover:bg-purple-800`;

  return (
    <div className={`relative ${isMobile ? 'mb-4' : ''}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isUpdating}
        className={`flex items-center justify-between px-3 py-2 transition-colors shadow-sm ${buttonStyles}`}
      >
        <span className="flex items-center">
          {isUpdating ? (
            <>
              <div className="w-4 h-4 mr-2 border-2 border-t-white border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
              Updating...
            </>
          ) : (
            formatSettings(displayedSetting)
          )}
        </span>
        <svg
          className={`h-5 w-5 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && !isUpdating && (
        <div className={`absolute ${isMobile ? 'left-0 right-0' : 'right-0'} mt-2 w-64 bg-white rounded-md shadow-lg z-50`}>
          <div className="py-1">
            <button
              onClick={() => handleSelect('MANUAL_REVIEW')}
              className={`block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 ${displayedSetting === 'MANUAL_REVIEW' ? 'bg-purple-100' : ''}`}
              disabled={isUpdating}
            >
              Manual review of comments
            </button>
            <button
              onClick={() => handleSelect('AUTO_HIDE')}
              className={`block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 ${displayedSetting === 'AUTO_HIDE' ? 'bg-purple-100' : ''}`}
              disabled={isUpdating}
            >
              Auto hide abusive comments
            </button>
            <button
              onClick={() => handleSelect('AUTO_DELETE')}
              className={`block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 ${displayedSetting === 'AUTO_DELETE' ? 'bg-purple-100' : ''}`}
              disabled={isUpdating}
            >
              Auto delete hateful comments
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 