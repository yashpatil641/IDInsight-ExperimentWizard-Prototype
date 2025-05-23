import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LightBulbIcon, CheckCircleIcon, SparklesIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

interface AISuggestionProps {
  suggestion: string;
  explanation: string;
  onAccept: (suggestion: any) => void;
  loading?: boolean;
  confidence?: 'high' | 'medium' | 'low';
  // New prop to indicate if this is showing multiple suggestions that each need their own button
  multiSuggestion?: boolean;
}

export default function AISuggestion({ 
  suggestion, 
  explanation, 
  onAccept, 
  loading = false,
  confidence = 'medium',
  multiSuggestion = false
}: AISuggestionProps) {
  const [expanded, setExpanded] = useState(false);
  const [accepted, setAccepted] = useState(false);
  
  const handleAccept = () => {
    setAccepted(true);
    onAccept(suggestion);
    
    // Reset accepted state after animation
    setTimeout(() => setAccepted(false), 2000);
  };
  
  // Determine confidence badge color
  const confidenceBadge = {
    high: { bg: "bg-green-900", text: "text-green-200", label: "High Confidence" },
    medium: { bg: "bg-blue-900", text: "text-blue-200", label: "Medium Confidence" },
    low: { bg: "bg-yellow-900", text: "text-yellow-200", label: "Low Confidence" }
  }[confidence];
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 border-l-4 border-blue-500 bg-gray-800/80 backdrop-blur-sm p-5 rounded-lg shadow-lg"
    >
      {/* Header with AI icon and suggestion type */}
      <div className="flex items-center mb-2">
        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600">
          <SparklesIcon className="h-4 w-4 text-white" />
        </div>
        <h3 className="ml-2 text-sm font-semibold text-gray-100">AI Assistant</h3>
        
        {/* Confidence indicator - only show for single suggestions */}
        {!loading && !multiSuggestion && (
          <span className={`ml-auto ${confidenceBadge.bg} ${confidenceBadge.text} text-xs px-2 py-1 rounded-full flex items-center`}>
            <CheckCircleIcon className="h-3 w-3 mr-1" />
            {confidenceBadge.label}
          </span>
        )}
      </div>
      
      {/* Loading state */}
      {loading ? (
        <div className="flex flex-col items-center py-4">
          <div className="relative h-10 w-10">
            <div className="absolute inset-0 rounded-full border-2 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
            <div className="absolute inset-1 rounded-full border-2 border-t-transparent border-r-blue-400 border-b-transparent border-l-transparent animate-spin"></div>
          </div>
          <p className="mt-3 text-sm text-gray-300">Analyzing your experiment data...</p>
        </div>
      ) : (
        <>
          {/* Suggestion content */}
          <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
            <p className="text-sm text-gray-200 leading-relaxed">
              {suggestion}
            </p>
          </div>
          
          {/* Explanation toggle button */}
          <div className="mt-3 flex items-center">
            <button 
              type="button"
              className="flex items-center text-xs text-blue-400 hover:text-blue-300 group"
              onClick={() => setExpanded(!expanded)}
              aria-expanded={expanded}
            >
              <InformationCircleIcon className="h-4 w-4 mr-1" />
              <span>{expanded ? 'Hide details' : 'See why this is recommended'}</span>
              <svg 
                className={`ml-1 h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5 ${expanded ? 'rotate-90' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          {/* Expandable explanation */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-3 p-3 text-xs text-gray-300 bg-gray-900/50 rounded-lg border border-gray-700">
                  <div className="flex items-start">
                    <LightBulbIcon className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <p className="ml-2 leading-relaxed">{explanation}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Action buttons - Only show for single suggestions */}
          {!multiSuggestion && (
            <div className="mt-4 flex justify-end">
              <button
                className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md
                  ${accepted 
                    ? 'bg-green-700 text-white ring-1 ring-green-500' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                  } transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                onClick={handleAccept}
                disabled={accepted}
                aria-label="Apply this suggestion"
              >
                {accepted ? (
                  <>
                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                    Applied Successfully
                  </>
                ) : (
                  <>
                    <SparklesIcon className="h-4 w-4 mr-2" />
                    Apply This Suggestion
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}