import { useContext, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import ExperimentContext from '../../context/ExperimentContext';
import AISuggestion from '../AISuggestion';
import Tooltip from '../Tooltip';
import { getRandomizationSuggestion } from '../../../services/aiSuggestionService';

export default function RandomizationSetup() {
  const { experimentData, updateExperimentData } = useContext(ExperimentContext);
  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      randomizationMethod: experimentData.randomizationMethod || '',
      treatment: experimentData.treatmentGroups?.length || 2,
      ratio: experimentData.assignmentRatio || 'equal'
    }
  });
  
  // Debug log to see what sample size is available
  console.log("Current sample size in context:", experimentData.sampleSize);
  
  const method = watch('randomizationMethod');
  
  // AI suggestion logic
  const [showSuggestion, setShowSuggestion] = useState(true);
  const [aiSuggestion, setAiSuggestion] = useState({
    loading: true,
    suggestion: 'simple',
    explanation: "Loading AI suggestion..."
  });
  
  // Fetch AI suggestion when relevant inputs change
  useEffect(() => {
    // Use a default sample size if not available rather than showing an error
    const sampleSize = experimentData.sampleSize || 0;
    
    if (!sampleSize || sampleSize <= 0) {
      setAiSuggestion({
        loading: false,
        suggestion: 'pending',
        explanation: "Please set your sample size first to get appropriate randomization recommendations."
      });
      return;
    }
    
    const fetchSuggestion = async () => {
      setAiSuggestion(prev => ({ ...prev, loading: true }));
      
      try {
        // Log the sample size we're using for the API call
        console.log("Fetching randomization suggestion with sample size:", sampleSize);
        
        // Use variables from context if available
        const result = await getRandomizationSuggestion(
          sampleSize, 
          experimentData.variables || null,
          null // Clusters could be added in future
        );
        
        setAiSuggestion({
          loading: false,
          suggestion: result.suggestion,
          explanation: result.explanation
        });
      } catch (error) {
        console.error("Error fetching AI suggestion:", error);
        setAiSuggestion({
          loading: false,
          suggestion: 'simple',
          explanation: "Simple randomization is efficient and adequate for most experiments."
        });
      }
    };
    
    fetchSuggestion();
  }, [experimentData.sampleSize, experimentData.variables]);
  
  const onAcceptSuggestion = (suggestion) => {
    if (suggestion !== 'pending') {
      setValue('randomizationMethod', suggestion);
      setShowSuggestion(false);
    }
  };
  
  const onSubmit = (data) => {
    updateExperimentData({
      randomizationMethod: data.randomizationMethod,
      treatmentGroups: Array(parseInt(data.treatment)).fill(0).map((_, i) => i === 0 ? 'Control' : `Treatment ${i}`),
      assignmentRatio: data.ratio
    });
    // Continue to next step handled by parent component
  };
  
  return (
    <div>
      <h2 className="text-xl font-semibold">Randomization Setup</h2>
      <p className="text-gray-600 mt-1">Configure how participants will be assigned to experiment groups</p>
      
      {/* Show current sample size for debugging/user reference */}
      <div className="mt-2 text-sm text-gray-500">
        Current sample size: {experimentData.sampleSize || 'Not set'}
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
        {/* Randomization method */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700">
            Randomization Method
            <Tooltip content="The method used to assign participants to treatment groups" />
          </label>
          
          <select
            {...register('randomizationMethod')}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="">Select a method</option>
            <option value="simple">Simple Randomization</option>
            <option value="stratified">Stratified Randomization</option>
            <option value="cluster">Cluster Randomization</option>
          </select>
          
          {showSuggestion && (
            <AISuggestion 
              suggestion={
                aiSuggestion.suggestion === 'pending' 
                  ? "Please set your sample size first" 
                  : `We recommend using ${aiSuggestion.suggestion} randomization`
              }
              explanation={aiSuggestion.explanation}
              onAccept={() => aiSuggestion.suggestion !== 'pending' && onAcceptSuggestion(aiSuggestion.suggestion)}
              loading={aiSuggestion.loading}
            />
          )}
        </div>
        
        {/* Conditional content based on selected method */}
        {method === 'stratified' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Stratification Variables
            </label>
            <p className="text-xs text-gray-500">
              Select variables that you want to ensure are balanced across treatment groups
            </p>
            <div className="mt-2">
              {/* Placeholder for variable selection UI */}
              <div className="text-sm text-gray-700 italic">
                (In a full implementation, this would show available variables from your data)
              </div>
            </div>
          </div>
        )}
        
        {/* Treatment groups */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Number of Treatment Groups
          </label>
          <select
            {...register('treatment')}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="2">2 (Control + 1 Treatment)</option>
            <option value="3">3 (Control + 2 Treatments)</option>
            <option value="4">4 (Control + 3 Treatments)</option>
            <option value="5">5 (Control + 4 Treatments)</option>
          </select>
        </div>
        
        {/* Assignment ratio */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Assignment Ratio
          </label>
          <div className="mt-2 space-y-4">
            <div className="flex items-center">
              <input
                id="equal"
                name="ratio"
                type="radio"
                value="equal"
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                {...register('ratio')}
              />
              <label htmlFor="equal" className="ml-3 block text-sm font-medium text-gray-700">
                Equal assignment (e.g., 1:1 or 1:1:1)
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="custom"
                name="ratio"
                type="radio"
                value="custom"
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                {...register('ratio')}
              />
              <label htmlFor="custom" className="ml-3 block text-sm font-medium text-gray-700">
                Custom ratio
              </label>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}