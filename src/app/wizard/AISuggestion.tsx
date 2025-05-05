import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LightBulbIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface AISuggestionProps {
  suggestion: string;
  explanation: string;
  onAccept: (suggestion: any) => void;
  loading?: boolean;
}

export default function AISuggestion({ suggestion, explanation, onAccept, loading = false }: AISuggestionProps) {
  const [expanded, setExpanded] = useState(false);
  const [accepted, setAccepted] = useState(false);
  
  const handleAccept = () => {
    setAccepted(true);
    onAccept(suggestion);
    
    // Reset accepted state after animation
    setTimeout(() => setAccepted(false), 2000);
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 border-l-4 border-purple-500 bg-gradient-to-r from-purple-50 to-white p-4 rounded-r-md shadow-sm"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-1">
          <LightBulbIcon className="h-5 w-5 text-purple-600" />
        </div>
        <div className="ml-3 flex-1">
          <div className="flex justify-between items-start">
            <p className="text-sm font-medium text-purple-900">
              AI Suggestion
            </p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              {loading ? 'Thinking...' : 'Smart Assistant'}
            </span>
          </div>
          
          {loading ? (
            <div className="animate-pulse mt-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mt-2"></div>
            </div>
          ) : (
            <>
              <p className="mt-1 text-sm text-gray-700">
                {suggestion}
              </p>
              
              <button 
                className="mt-2 text-xs text-purple-700 hover:text-purple-900 flex items-center"
                onClick={() => setExpanded(!expanded)}
              >
                <span>{expanded ? 'Hide explanation' : 'Why this suggestion?'}</span>
                <svg className={`ml-1 h-4 w-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="mt-2 text-xs text-gray-600 bg-white p-3 rounded border border-purple-100">
                      {explanation}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="mt-3">
                <button
                  className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md ${
                    accepted 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  } transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
                  onClick={handleAccept}
                  disabled={accepted}
                >
                  {accepted ? (
                    <>
                      <CheckCircleIcon className="h-4 w-4 mr-1" />
                      Applied
                    </>
                  ) : (
                    'Apply Suggestion'
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}