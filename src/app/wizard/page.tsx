"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ExperimentContext from '../context/ExperimentContext';
import StepIndicator from './StepIndicator';
import BasicInfo from './steps/BasicInfo';
import RandomizationSetup from './steps/RandomizationSetup';
import SampleSizeCalculator from './steps/SampleSizeCalculator';
import VariablesSetup from './steps/VariablesSetup';
import Review from './steps/Review';

const steps = [
  { id: 'basic', name: 'Basic Information' },
  { id: 'sample', name: 'Sample Size' },
  { id: 'randomization', name: 'Randomization Method' },
  { id: 'variables', name: 'Variables & Metrics' },
  { id: 'review', name: 'Review & Create' }
];

export default function ExperimentWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [experimentData, setExperimentData] = useState({
    title: '',
    description: '',
    randomizationMethod: '',
    sampleSize: null,
    variables: [],
    treatmentGroups: []
  });
  
  const nextStep = () => {
    // Save the current form data before moving to the next step
    const currentForm = document.querySelector('form');
    if (currentForm) {
      const submitEvent = new Event('submit', { cancelable: true, bubbles: true });
      currentForm.dispatchEvent(submitEvent);
    }
    
    // Move to next step
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };
  
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));
  
  const updateExperimentData = (newData) => {
    setExperimentData(prev => {
      const updated = {...prev, ...newData};
      console.log("Updated experiment data:", updated);
      return updated;
    });
  };
  
  const renderStepContent = () => {
    switch(currentStep) {
      case 0: return <BasicInfo />;
      case 1: return <SampleSizeCalculator />;
      case 2: return <RandomizationSetup />;
      case 3: return <VariablesSetup />;
      case 4: return <Review />;
      default: return null;
    }
  };
  
  // Debug: Log experiment data when it changes
  useEffect(() => {
    console.log("Experiment data updated:", experimentData);
  }, [experimentData]);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            AI-Powered Experiment Creator
          </h1>
          <p className="mt-3 text-xl text-gray-500 sm:mt-4">
            Design your experiment with intelligent guidance at every step
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="px-6 py-6 sm:px-10">
            <StepIndicator steps={steps} currentStep={currentStep} />
            
            <ExperimentContext.Provider value={{ experimentData, updateExperimentData }}>
              <div className="mt-10 mb-10 min-h-[400px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    {renderStepContent()}
                  </motion.div>
                </AnimatePresence>
              </div>
              
              <div className="mt-8 pt-5 border-t border-gray-200 flex justify-between">
                <button 
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Previous step"
                >
                  <svg className="mr-2 -ml-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
                
                {currentStep < steps.length - 1 ? (
                  <button 
                    onClick={nextStep}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    aria-label="Next step"
                  >
                    Continue
                    <svg className="ml-2 -mr-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ) : (
                  <button 
                    onClick={() => alert('Experiment created!')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    aria-label="Create experiment"
                  >
                    <svg className="mr-2 -ml-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Create Experiment
                  </button>
                )}
              </div>
            </ExperimentContext.Provider>
          </div>
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-500">
          Powered by AI to make experiment design accessible for everyone
        </div>
      </div>
    </div>
  );
}