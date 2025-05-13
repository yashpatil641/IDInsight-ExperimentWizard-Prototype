"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ExperimentContext from '../context/ExperimentContext';
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

  const goToNextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  const updateExperimentData = (newData) => {
    setExperimentData(prev => {
      const updated = { ...prev, ...newData };
      console.log("Updated experiment data:", updated);
      return updated;
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: return <BasicInfo goToNext={goToNextStep} />;
      case 1: return <SampleSizeCalculator goToNext={goToNextStep} />;
      case 2: return <RandomizationSetup goToNext={goToNextStep} />;
      case 3: return <VariablesSetup goToNext={goToNextStep} />;
      case 4: return <Review />;
      default: return null;
    }
  };

  useEffect(() => {
    console.log("Experiment data updated:", experimentData);
  }, [experimentData]);

  return (
    <div className="flex items-center justify-center overflow-hidden p-18">
      <div className="w-full max-w-4xl px-4">
        <div className="bg-[#10161fe8] rounded-lg p-5 border border-gray-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-blue-400">
                AI Experiment Creator
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                IDInsight Experiments Engine
              </p>
            </div>
            <div className="mt-2 sm:mt-0 flex items-center">
              <div className={`h-2 w-2 rounded-full ${currentStep === steps.length - 1 ? 'bg-green-500' : 'bg-blue-500'} mr-2`}></div>
              <span className="text-sm font-medium text-blue-300">
                {steps[currentStep].name}
                <span className="ml-2 text-xs font-normal text-gray-400">
                  Step {currentStep + 1} of {steps.length}
                </span>
              </span>
            </div>
          </div>
          {/* Enhanced Step Indicators */}
          <div className="mb-18 ml-18">
            <div className="flex items-center">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center w-full">
                  {/* Step and connector */}
                  <div className="relative flex flex-col items-center">
                    {/* Step circle */}
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${index < currentStep
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : index === currentStep
                            ? 'bg-blue-900 border-blue-500 text-blue-300'
                            : 'bg-gray-800 border-gray-700 text-gray-500'
                        }`}
                    >
                      {index < currentStep ? (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                        </svg>
                      ) : (
                        <span className="text-xs font-semibold">{index + 1}</span>
                      )}
                    </div>

                    {/* Step Label */}
                    <div className="absolute mt-10 text-center w-[120px]">
                      <span className={`text-xs  ${index <= currentStep ? 'text-blue-400' : 'text-gray-500'
                        }`}>
                        {step.name}
                      </span>
                    </div>
                  </div>

                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div className={`flex-auto border-t-2 ${index < currentStep ? 'border-blue-600' : 'border-gray-700'
                      }`}></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <ExperimentContext.Provider value={{ experimentData, updateExperimentData }}>
            <div className=" overflow-y-auto pr-2 pb-2">
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

            <div className="mt-4 pt-4 border-t border-gray-800 flex justify-between">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className="flex items-center justify-center px-3 py-1.5 border border-gray-700 rounded-md text-gray-300 bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Previous step"
              >
                <svg className="h-4 w-4 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="sr-only">Back</span>
              </button>

              {currentStep < steps.length - 1 ? (
                <button
                  type="submit"
                  form={`${steps[currentStep].id}-form`}
                  className="px-3 py-1.5 rounded-md text-white bg-blue-500 hover:bg-blue-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  aria-label="Continue to next step"
                >
                  Next
                  <svg className="ml-1 h-4 w-4 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={() => alert('Experiment created!')}
                  className="px-3 py-1.5 rounded-md text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-1 focus:ring-green-500"
                  aria-label="Create experiment"
                >
                  Create
                </button>
              )}
            </div>
          </ExperimentContext.Provider>
        </div>
      </div>
    </div>
  );
}