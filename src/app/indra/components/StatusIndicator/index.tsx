'use client';

import React from 'react';

interface StatusIndicatorProps {
  message: string;
  loading: boolean;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ message, loading }) => {
  if (!message && !loading) return null;

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center">
        {loading ? (
          <div className="mr-3 flex-shrink-0">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="mr-3 flex-shrink-0">
            <svg className="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )}
        <div>
          <p className="text-sm text-gray-700">
            {message || (loading ? "Traitement en cours..." : "")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatusIndicator;