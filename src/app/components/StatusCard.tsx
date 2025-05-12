'use client';

interface StatusCardProps {
  lastAnalyzedAt?: string | null;
  activeTab: 'positive' | 'negative';
  onTabChange: (tab: 'positive' | 'negative') => void;
}

export default function StatusCard({ 
  lastAnalyzedAt, 
  activeTab, 
  onTabChange 
}: StatusCardProps) {
  // Format the timestamp if available
  const formattedTime = lastAnalyzedAt ? 
    new Date(lastAnalyzedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 
    null;
    
  return (
    <div className="mb-6">
      <div className="text-center text-gray-600 text-sm mb-3">
        {formattedTime ? (
          `Last analysed at ${formattedTime}`
        ) : (
          <span className="inline-flex items-center">
            <span className="animate-pulse">Analyzing content</span>
            <span className="ml-1 inline-flex space-x-1">
              <span className="animate-pulse delay-100">.</span>
              <span className="animate-pulse delay-200">.</span>
              <span className="animate-pulse delay-300">.</span>
            </span>
          </span>
        )}
      </div>
      
      <div className="flex rounded-xl overflow-hidden shadow-sm border border-purple-100">
        <button
          onClick={() => onTabChange('positive')}
          className={`flex-1 py-3 px-4 font-medium transition-all duration-200 ${
            activeTab === 'positive' 
              ? 'bg-white text-purple-700 shadow-sm' 
              : 'bg-purple-200/60 text-purple-600 hover:bg-purple-200'
          }`}
        >
          <div className="flex items-center justify-center">
            {activeTab === 'positive' && (
              <span className="inline-block mr-2 w-2 h-2 bg-purple-500 rounded-full"></span>
            )}
            Positive
          </div>
        </button>
        <button
          onClick={() => onTabChange('negative')}
          className={`flex-1 py-3 px-4 font-medium transition-all duration-200 ${
            activeTab === 'negative' 
              ? 'bg-white text-purple-700 shadow-sm' 
              : 'bg-purple-200/60 text-purple-600 hover:bg-purple-200'
          }`}
        >
          <div className="flex items-center justify-center">
            {activeTab === 'negative' && (
              <span className="inline-block mr-2 w-2 h-2 bg-purple-500 rounded-full"></span>
            )}
            Negative
          </div>
        </button>
      </div>
      
      <div className="flex justify-end mt-1">
        <div className="text-xs text-purple-600 italic">
          {activeTab === 'positive' ? 'Showing safe content' : 'Showing harmful content'}
        </div>
      </div>
    </div>
  );
} 