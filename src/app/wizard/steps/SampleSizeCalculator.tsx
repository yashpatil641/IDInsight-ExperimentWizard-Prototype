import { useContext, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import ExperimentContext from '../../context/ExperimentContext';
import AISuggestion from '../AISuggestion';
import Tooltip from '../Tooltip';
import { getSampleSizeSuggestion } from '../../../services/aiSuggestionService';

export default function SampleSizeCalculator() {
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
  
  // AI suggestion logic
  const [showSuggestion, setShowSuggestion] = useState(true);
  const [aiSuggestion, setAiSuggestion] = useState({
    loading: true,
    suggestion: 384,
    explanation: "Loading AI suggestion..."
  });
  
  // Fetch AI suggestion when domain changes
  useEffect(() => {
    const fetchSuggestion = async () => {
      setAiSuggestion(prev => ({ ...prev, loading: true }));
      
      const mde = watch('mde');
      const expectedEffect = mde === '0.1' ? 'small' : mde === '0.5' ? 'large' : 'medium';
      
      try {
        const result = await getSampleSizeSuggestion('experiment', domain, expectedEffect);
        setAiSuggestion({
          loading: false,
          suggestion: result.suggestion,
          explanation: result.explanation
        });
      } catch (error) {
        console.error("Error fetching AI suggestion:", error);
        setAiSuggestion({
          loading: false,
          suggestion: 384,
          explanation: "This is a standard sample size for many experiments with medium effect sizes."
        });
      }
    };
    
    fetchSuggestion();
  }, [domain, watch('mde')]);
  
  const onAcceptSuggestion = (suggestion) => {
    setValue('sampleSize', suggestion);
    // Update the context immediately when accepting suggestion
    updateExperimentData({
      sampleSize: parseInt(suggestion)
    });
    setShowSuggestion(false);
  };
  
  const calculateSampleSize = () => {
    // Placeholder for actual sample size calculation
    return 384;
  };
  
  const onSubmit = (data) => {
    // Make sure the sample size is parsed as a number
    const sampleSizeValue = parseInt(data.sampleSize);
    
    updateExperimentData({
      sampleSize: sampleSizeValue,
      powerCalculation: {
        mde: parseFloat(data.mde),
        power: parseFloat(data.power),
        alpha: parseFloat(data.alpha)
      }
    });
    
    // Optional: Log to confirm the update
    console.log("Updated experiment data with sample size:", sampleSizeValue);
  };
  
  return (
    <div>
      <h2 className="text-xl font-semibold">Sample Size Determination</h2>
      <p className="text-gray-600 mt-1">Determine how many participants you need for statistically significant results</p>
      
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Sample Size Determination Method
          </label>
          <div className="mt-2 space-y-4">
            <div className="flex items-center">
              <input
                id="manual"
                name="calculationType"
                type="radio"
                value="manual"
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                {...register('calculationType')}
              />
              <label htmlFor="manual" className="ml-3 block text-sm font-medium text-gray-700">
                I'll set the sample size manually
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="calculator"
                name="calculationType"
                type="radio"
                value="calculator"
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                {...register('calculationType')}
              />
              <label htmlFor="calculator" className="ml-3 block text-sm font-medium text-gray-700">
                Calculate based on statistical parameters
              </label>
            </div>
          </div>
        </div>
        
        {calculationType === 'manual' ? (
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700">
              Total Sample Size
              <Tooltip content="The total number of participants across all groups" />
            </label>
            <input
              type="number"
              min="1"
              {...register('sampleSize')}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            
            {showSuggestion && (
              <AISuggestion 
                suggestion={`We recommend a minimum sample size of ${aiSuggestion.suggestion}`}
                explanation={aiSuggestion.explanation}
                onAccept={() => onAcceptSuggestion(aiSuggestion.suggestion)}
                loading={aiSuggestion.loading}
              />
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700">
                Minimum Detectable Effect (MDE)
                <Tooltip content="The smallest effect size you want to be able to detect" />
              </label>
              <select
                {...register('mde')}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="0.1">Small (0.1)</option>
                <option value="0.2">Medium (0.2)</option>
                <option value="0.5">Large (0.5)</option>
              </select>
            </div>
            
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700">
                Statistical Power
                <Tooltip content="The probability of detecting an effect if it exists" />
              </label>
              <select
                {...register('power')}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="0.8">80% (standard)</option>
                <option value="0.9">90% (high)</option>
                <option value="0.7">70% (lower)</option>
              </select>
            </div>
            
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700">
                Significance Level (α)
                <Tooltip content="The probability of falsely rejecting the null hypothesis" />
              </label>
              <select
                {...register('alpha')}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="0.05">5% (standard)</option>
                <option value="0.01">1% (stringent)</option>
                <option value="0.1">10% (lenient)</option>
              </select>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700">Calculated Sample Size:</span>
                <span className="text-sm font-bold">{calculateSampleSize()}</span>
              </div>
              <button
                type="button"
                className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => setValue('sampleSize', calculateSampleSize())}
              >
                Use this value
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}