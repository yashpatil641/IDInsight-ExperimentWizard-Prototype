"use client";	

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

interface TooltipProps {
  content: string;
}

export default function Tooltip({ content }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  
  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setIsVisible(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <div className="relative ml-2 inline-block" ref={tooltipRef}>
      <button 
        type="button"
        className="text-gray-400 hover:text-gray-500 focus:outline-none"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        aria-label="Show information"
      >
        <QuestionMarkCircleIcon className="h-4 w-4" />
      </button>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className="absolute z-10 w-64 px-4 py-3 text-sm text-left font-normal text-gray-700 bg-white border border-gray-200 rounded-md shadow-lg whitespace-normal transform -translate-x-1/2 left-1/2 mt-2"
          >
            <div className="absolute inset-x-0 top-0 transform -translate-y-1 flex justify-center">
              <div className="w-3 h-3 rotate-45 bg-white border-t border-l border-gray-200"></div>
            </div>
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}