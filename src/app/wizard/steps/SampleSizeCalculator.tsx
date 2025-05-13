import { useContext, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import ExperimentContext from '../../context/ExperimentContext';
import AISuggestion from '../AISuggestion';
import Tooltip from '../Tooltip';
import { getSampleSizeSuggestion } from '../../../services/aiSuggestionService';

// This component demonstrates how AI assistance would enhance the existing sample size calculation
// in experiments-engine while maintaining the current functionality
export default function SampleSizeCalculator({ goToNext }) {
  // In actual integration, we would use the Zustand store pattern from experiments-engine:
  // const { experimentState, updateSampleSize, updatePowerCalculation } = useExperimentStore();
  const { experimentData, updateExperimentData } = useContext(ExperimentContext);
  
  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      calculationType: 'manual',
      sampleSize: experimentData.sampleSize || '',
      mde: '0.2', // Minimum detectable effect
      power: '0.8', // Statistical power
      alpha: '0.05', // Significance level
    }
  });
  
  const calculationType = watch('calculationType');
  const domain = experimentData.domain || 'default';
  const experimentType = experimentData.experimentType || 'mab';
  const mde = watch('mde');
  const power = watch('power');
  const alpha = watch('alpha');
  
  // AI suggestion logic
  const [showSuggestion, setShowSuggestion] = useState(true);
  const [aiSuggestion, setAiSuggestion] = useState({
    loading: true,
    suggestion: 384,
    explanation: "Loading AI suggestion..."
  });
  
  // Fetch AI suggestion when relevant inputs change
  useEffect(() => {
    const fetchSuggestion = async () => {
      setAiSuggestion(prev => ({ ...prev, loading: true }));
      
      const expectedEffect = mde === '0.1' ? 'small' : mde === '0.5' ? 'large' : 'medium';
      
      try {
        // Enhanced to include experiment type for more specific recommendations
        const result = await getSampleSizeSuggestion(experimentType, domain, expectedEffect);
        setAiSuggestion({
          loading: false,
          suggestion: result.suggestion,
          explanation: result.explanation
        });
      } catch (error) {
        console.error("Error fetching AI suggestion:", error);
        
        // Fallback suggestions based on experiment type
        let fallbackSuggestion = 384;
        let fallbackExplanation = "This is a standard sample size for many experiments with medium effect sizes.";
        
        if (experimentType === 'mab') {
          fallbackSuggestion = 500;
          fallbackExplanation = "Multi-Armed Bandit experiments typically need larger sample sizes to account for exploration phases.";
        } else if (experimentType === 'cmab') {
          fallbackSuggestion = 600;
          fallbackExplanation = "Contextual MABs require larger samples to accurately model contextual effects.";
        }
        
        setAiSuggestion({
          loading: false,
          suggestion: fallbackSuggestion,
          explanation: fallbackExplanation
        });
      }
    };
    
    fetchSuggestion();
  }, [domain, experimentType, mde]);
  
  const onAcceptSuggestion = (suggestion) => {
    setValue('sampleSize', suggestion);
    // Update the context immediately when accepting suggestion
    updateExperimentData({
      sampleSize: parseInt(suggestion)
    });
    setShowSuggestion(false);
  };
  
  const calculateSampleSize = () => {
    // Simple sample size calculation based on selected parameters
    // This is a simplified formula - actual implementation would be more sophisticated
    let baseSize = 16;
    
    if (mde === '0.1') baseSize = 100;
    else if (mde === '0.2') baseSize = 25;
    else if (mde === '0.5') baseSize = 4;
    
    if (power === '0.9') baseSize *= 1.3;
    else if (power === '0.7') baseSize *= 0.8;
    
    if (alpha === '0.01') baseSize *= 1.75;
    else if (alpha === '0.1') baseSize *= 0.7;
    
    // Adjust for experiment type
    if (experimentType === 'mab') baseSize *= 1.2;
    else if (experimentType === 'cmab') baseSize *= 1.5;
    
    return Math.ceil(baseSize) * 4;
  };
  
  const onSubmit = (data) => {
    // Make sure the sample size is parsed as a number
    const sampleSizeValue = parseInt(data.sampleSize) || calculateSampleSize();
    
    updateExperimentData({
      sampleSize: sampleSizeValue,
      powerCalculation: {
        mde: parseFloat(data.mde),
        power: parseFloat(data.power),
        alpha: parseFloat(data.alpha)
      }
    });
    
    if (goToNext) {
      goToNext();
    }
  };
  
  // Visual representation of how the chosen parameters affect power and precision
  const renderPowerVisualization = () => {
    const powerPercentage = parseFloat(power) * 100;
    
    return (
      <div className="mt-4">
        <p className="text-sm font-medium text-gray-300">Statistical Power</p>
        <div className="mt-1 w-full bg-gray-700 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full" 
            style={{ width: `${powerPercentage}%` }}
          ></div>
        </div>
        <p className="mt-1 text-xs text-gray-400">
          {powerPercentage}% chance of detecting an effect if it exists
        </p>
        
        <p className="mt-3 text-sm font-medium text-gray-300">Effect Size Precision</p>
        <div className="mt-1 w-full bg-gray-700 rounded-full h-2.5">
          {mde === '0.1' ? (
            <div className="bg-green-600 h-2.5 rounded-full w-3/4"></div>
          ) : mde === '0.2' ? (
            <div className="bg-yellow-600 h-2.5 rounded-full w-1/2"></div>
          ) : (
            <div className="bg-red-600 h-2.5 rounded-full w-1/4"></div>
          )}
        </div>
        <p className="mt-1 text-xs text-gray-400">
          {mde === '0.1' ? 'High precision (can detect small effects)' : 
           mde === '0.2' ? 'Medium precision (moderate effects)' : 
           'Low precision (only large effects detectable)'}
        </p>
      </div>
    );
  };
  
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-100">Sample Size Determination</h2>
      <p className="text-gray-400 mt-1">Determine how many participants you need for statistically significant results</p>
      
      {/* Add experiment context information */}
      <div className="mt-3 p-3 bg-gray-800 border border-gray-700 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-300">{experimentType.toUpperCase()} Experiment in {domain}</h3>
            <div className="mt-1 text-sm text-gray-400">
              <p>Your sample size needs depend on your experiment type and goals:</p>
              {experimentType === 'mab' && (
                <p className="mt-1">Multi-Armed Bandits typically need larger sample sizes than traditional A/B tests to account for the exploration phase.</p>
              )}
              {experimentType === 'cmab' && (
                <p className="mt-1">Contextual MABs require sufficient data to model the relationship between contexts and outcomes accurately.</p>
              )}
              {experimentType === 'bayesian_ab' && (
                <p className="mt-1">Bayesian approaches can often work with smaller sample sizes but still require sufficient data to update prior beliefs.</p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <form id='sample-form' onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6 px-4">
        <div>
          <label className="block text-sm font-medium text-gray-300">
            Sample Size Determination Method
          </label>
          <div className="mt-2 space-y-4">
            <div className="flex items-center">
              <input
                id="manual"
                name="calculationType"
                type="radio"
                value="manual"
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-700 bg-gray-800"
                {...register('calculationType')}
              />
              <label htmlFor="manual" className="ml-3 block text-sm font-medium text-gray-300">
                I'll set the sample size manually
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="calculator"
                name="calculationType"
                type="radio"
                value="calculator"
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-700 bg-gray-800"
                {...register('calculationType')}
              />
              <label htmlFor="calculator" className="ml-3 block text-sm font-medium text-gray-300">
                Calculate based on statistical parameters
              </label>
            </div>
          </div>
        </div>
        
        {calculationType === 'manual' ? (
          <div>
            <label className="flex items-center text-sm font-medium text-gray-300">
              Total Sample Size
              <Tooltip content="The total number of participants across all groups" />
            </label>
            <input
              type="number"
              min="1"
              {...register('sampleSize')}
              className="mt-1 block w-full border border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-800 text-gray-200"
            />
            
            {showSuggestion && (
              <AISuggestion 
                suggestion={`We recommend a minimum sample size of ${aiSuggestion.suggestion} for your ${experimentType.toUpperCase()} experiment`}
                explanation={aiSuggestion.explanation}
                onAccept={() => onAcceptSuggestion(aiSuggestion.suggestion)}
                loading={aiSuggestion.loading}
              />
            )}
            
            {/* Add educational content about sample size implications */}
            <div className="mt-4 p-3 bg-gray-800 border border-gray-700 rounded-md">
              <p className="text-sm text-gray-300 font-medium">Sample Size Considerations:</p>
              <ul className="mt-2 text-xs text-gray-400 space-y-1 list-disc pl-5">
                <li>Too small: May not detect real effects (false negatives)</li>
                <li>Too large: Wastes resources and may detect trivial effects</li>
                <li>For {experimentType.toUpperCase()}: {
                  experimentType === 'mab' 
                    ? "Ensure enough data for both exploration and exploitation phases" 
                    : experimentType === 'cmab' 
                      ? "Need sufficient data for each context combination" 
                      : "Consider your prior certainty and desired posterior precision"
                }</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="flex items-center text-sm font-medium text-gray-300">
                Minimum Detectable Effect (MDE)
                <Tooltip content="The smallest effect size you want to be able to detect" />
              </label>
              <select
                {...register('mde')}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-gray-200 border-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-gray-800"
              >
                <option value="0.1">Small (0.1) - Subtle changes</option>
                <option value="0.2">Medium (0.2) - Moderate improvements</option>
                <option value="0.5">Large (0.5) - Major differences</option>
              </select>
              <p className="mt-1 text-xs text-gray-400">
                Smaller effects require larger sample sizes to detect reliably
              </p>
            </div>
            
            <div>
              <label className="flex items-center text-sm font-medium text-gray-300">
                Statistical Power
                <Tooltip content="The probability of detecting an effect if it exists" />
              </label>
              <select
                {...register('power')}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-gray-200 border-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-gray-800"
              >
                <option value="0.8">80% (standard)</option>
                <option value="0.9">90% (high)</option>
                <option value="0.7">70% (lower)</option>
              </select>
              <p className="mt-1 text-xs text-gray-400">
                Higher power reduces false negatives but requires larger samples
              </p>
            </div>
            
            <div>
              <label className="flex items-center text-sm font-medium text-gray-300">
                Significance Level (α)
                <Tooltip content="The probability of falsely rejecting the null hypothesis" />
              </label>
              <select
                {...register('alpha')}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-gray-200 border-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-gray-800"
              >
                <option value="0.05">5% (standard)</option>
                <option value="0.01">1% (stringent)</option>
                <option value="0.1">10% (lenient)</option>
              </select>
              <p className="mt-1 text-xs text-gray-400">
                Lower alpha reduces false positives but requires larger samples
              </p>
            </div>
            
            {/* Visual representation of power and precision */}
            {renderPowerVisualization()}
            
            <div className="pt-4 border-t border-gray-700">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-300">Calculated Sample Size:</span>
                <span className="text-sm font-bold text-gray-200">{calculateSampleSize()}</span>
              </div>
              <button
                type="button"
                className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-300 bg-blue-900 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => setValue('sampleSize', calculateSampleSize())}
              >
                Use this value
              </button>
              <p className="mt-2 text-xs text-gray-400">
                This calculation is an estimate based on standard statistical formulas. 
                Actual requirements may vary based on experiment specifics.
              </p>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}