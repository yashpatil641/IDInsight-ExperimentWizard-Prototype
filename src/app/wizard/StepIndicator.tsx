import { CheckIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

interface Step {
  id: string;
  name: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export default function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="py-4">
      {/* Progress bar */}
      <div className="relative">
        <div className="overflow-hidden h-2 mb-6 text-xs flex rounded bg-gray-200">
          <motion.div 
            initial={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            transition={{ duration: 0.5 }}
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-blue-600 to-purple-600"
          />
        </div>
      </div>
      
      {/* Step circles */}
      <nav className="flex justify-between items-center">
        {steps.map((step, index) => (
          <div 
            key={step.id} 
            className={`flex flex-col items-center ${index <= currentStep ? 'text-blue-600' : 'text-gray-400'}`}
          >
            <div 
              className={`flex h-8 w-8 items-center justify-center rounded-full 
                ${index < currentStep ? 'bg-gradient-to-r from-blue-600 to-purple-600' : ''} 
                ${index === currentStep ? 'border-2 border-blue-600 bg-white' : ''} 
                ${index > currentStep ? 'border-2 border-gray-300 bg-white' : ''}`}
            >
              {index < currentStep ? (
                <CheckIcon className="h-5 w-5 text-white" />
              ) : (
                <span className={`text-sm font-semibold ${index === currentStep ? 'text-blue-600' : 'text-gray-400'}`}>
                  {index + 1}
                </span>
              )}
            </div>
            <span className={`mt-2 text-xs font-medium ${index <= currentStep ? 'text-blue-600' : 'text-gray-500'}`}>
              {step.name}
            </span>
          </div>
        ))}
      </nav>
    </div>
  );
}