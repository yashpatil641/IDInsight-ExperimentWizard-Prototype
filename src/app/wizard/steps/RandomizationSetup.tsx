import { useContext, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import ExperimentContext from '../../context/ExperimentContext';
import AISuggestion from '../AISuggestion';
import Tooltip from '../Tooltip';
import { getRandomizationSuggestion } from '../../../services/aiSuggestionService';

// This component demonstrates how AI assistance would enhance the existing randomization setup
// in experiments-engine while maintaining the current functionality
export default function RandomizationSetup({ goToNext }) {
  // In actual integration, we would use the Zustand store pattern from experiments-engine:
  // const { experimentState, updateRandomizationMethod, updateTreatmentGroups } = useExperimentStore();
  const { experimentData, updateExperimentData } = useContext(ExperimentContext);
  
  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      randomizationMethod: experimentData.randomizationMethod || '',
      treatment: experimentData.treatmentGroups?.length || 2,
      ratio: experimentData.assignmentRatio || 'equal',
      customRatioValue: experimentData.customRatioValue || ''
    }
  });
  
  const method = watch('randomizationMethod');
  const treatmentCount = parseInt(watch('treatment') || '2');
  const assignmentRatio = watch('ratio');
  const customRatioValue = watch('customRatioValue');
  
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
      assignmentRatio: data.ratio,
      customRatioValue: data.customRatioValue
    });
    
    if (goToNext) {
      goToNext();
    }
  };
  
  // Function to generate assignment ratio visualization
  const renderAssignmentPreview = () => {
    if (assignmentRatio === 'equal') {
      // Equal distribution
      return (
        <>
          {Array(treatmentCount).fill(0).map((_, i) => (
            <div 
              key={i}
              className={`h-full ${
                i === 0 ? 'bg-gray-600' : 'bg-blue-600'
              }`} 
              style={{ width: `${100 / treatmentCount}%` }}
            >
              <div className="h-full flex items-center justify-center text-xs text-white font-medium">
                {i === 0 ? 'Control' : `T${i}`}
              </div>
            </div>
          ))}
        </>
      );
    } else if (customRatioValue) {
      // Parse custom ratio (e.g., "2:1:1")
      try {
        const parts = customRatioValue.split(':').map(Number);
        if (parts.length !== treatmentCount || parts.some(isNaN)) {
          throw new Error('Invalid ratio format');
        }
        
        const total = parts.reduce((sum, val) => sum + val, 0);
        
        return (
          <>
            {parts.map((value, i) => (
              <div 
                key={i}
                className={`h-full ${i === 0 ? 'bg-gray-600' : 'bg-blue-600'}`} 
                style={{ width: `${(value / total) * 100}%` }}
              >
                <div className="h-full flex items-center justify-center text-xs text-white font-medium">
                  {i === 0 ? 'Control' : `T${i}`}
                </div>
              </div>
            ))}
          </>
        );
      } catch (e) {
        // If parsing fails, show placeholder
        return (
          <div className="h-full w-full bg-gray-700 flex items-center justify-center text-xs text-white">
            Invalid ratio format
          </div>
        );
      }
    } else {
      // Custom but not specified
      return (
        <div className="h-full w-full bg-gray-700 flex items-center justify-center text-xs text-white">
          Define custom ratio
        </div>
      );
    }
  };
  
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-100">Randomization Setup</h2>
      <p className="text-gray-400 mt-1">Configure how participants will be assigned to experiment groups</p>
      
      {/* Enhanced contextual information */}
      <div className="mt-3 p-3 bg-gray-800 border border-gray-700 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-300">Based on your inputs</h3>
            <div className="mt-1 text-sm text-gray-300">
              <p>Your experiment has a sample size of <span className="font-semibold">{experimentData.sampleSize || 'not yet set'}</span>.</p>
              <p className="mt-1">The randomization method you choose will affect how participants are assigned to treatment groups.</p>
            </div>
          </div>
        </div>
      </div>
      
      <form id='randomization-form' onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6 px-4">
        {/* Randomization method */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-300">
            Randomization Method
            <Tooltip content="The method used to assign participants to treatment groups" />
          </label>
          
          <select
            {...register('randomizationMethod')}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-gray-200 border-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-gray-800"
          >
            <option value="">Select a method</option>
            <option value="simple">Simple Randomization</option>
            <option value="stratified">Stratified Randomization</option>
            <option value="cluster">Cluster Randomization</option>
          </select>
          
          {/* Add better explanations based on selection */}
          {method && (
            <div className="mt-2 text-xs text-gray-400">
              {method === 'simple' && (
                <p>Simple randomization assigns participants completely at random, like flipping a coin. Best for larger sample sizes (>100).</p>
              )}
              {method === 'stratified' && (
                <p>Stratified randomization ensures balance across important variables like gender or age group. Recommended when these factors might affect outcomes.</p>
              )}
              {method === 'cluster' && (
                <p>Cluster randomization assigns groups (e.g., schools, villages) rather than individuals. Use when interventions affect entire groups.</p>
              )}
            </div>
          )}
          
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
            <label className="block text-sm font-medium text-gray-300">
              Stratification Variables
            </label>
            <p className="text-xs text-gray-400">
              Select variables that you want to ensure are balanced across treatment groups
            </p>
            <div className="mt-2 space-y-2">
              {/* Example of variable selection UI */}
              {['Age Group', 'Gender', 'Location'].map((variable) => (
                <div key={variable} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`var-${variable}`}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-700 bg-gray-800"
                  />
                  <label htmlFor={`var-${variable}`} className="ml-3 block text-sm text-gray-300">
                    {variable}
                  </label>
                </div>
              ))}
              <p className="text-xs text-gray-400 italic">
                (In the integrated version, this would show variables from your experiment context)
              </p>
            </div>
          </div>
        )}
        
        {method === 'cluster' && (
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Cluster Details
            </label>
            <p className="text-xs text-gray-400">
              Define the clusters you'll use for randomization
            </p>
            <div className="mt-2 space-y-3">
              <div>
                <label className="text-xs text-gray-300">Cluster Type</label>
                <select
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-gray-200 border-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-gray-800"
                >
                  <option>School</option>
                  <option>Village</option>
                  <option>Hospital</option>
                  <option>Other</option>
                </select>
              </div>
              
              <div>
                <label className="text-xs text-gray-300">Estimated number of clusters</label>
                <input
                  type="number"
                  className="mt-1 block w-full border border-gray-700 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-800 text-gray-200"
                  placeholder="e.g., 20"
                  min="2"
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Treatment groups */}
        <div>
          <label className="block text-sm font-medium text-gray-300">
            Number of Treatment Groups
          </label>
          <select
            {...register('treatment')}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-gray-200 border-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-gray-800"
          >
            <option value="2">2 (Control + 1 Treatment)</option>
            <option value="3">3 (Control + 2 Treatments)</option>
            <option value="4">4 (Control + 3 Treatments)</option>
            <option value="5">5 (Control + 4 Treatments)</option>
          </select>
        </div>
        
        {/* Assignment ratio */}
        <div>
          <label className="block text-sm font-medium text-gray-300">
            Assignment Ratio
          </label>
          <div className="mt-2 space-y-4">
            <div className="flex items-center">
              <input
                id="equal"
                name="ratio"
                type="radio"
                value="equal"
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-700 bg-gray-800"
                {...register('ratio')}
              />
              <label htmlFor="equal" className="ml-3 block text-sm font-medium text-gray-300">
                Equal assignment (e.g., 1:1 or 1:1:1)
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="custom"
                name="ratio"
                type="radio"
                value="custom"
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-700 bg-gray-800"
                {...register('ratio')}
              />
              <label htmlFor="custom" className="ml-3 block text-sm font-medium text-gray-300">
                Custom ratio
              </label>
            </div>
            
            {/* Custom ratio input */}
            {assignmentRatio === 'custom' && (
              <div className="pl-7">
                <label htmlFor="customRatio" className="block text-sm font-medium text-gray-300">
                  Specify ratio (e.g., 2:1)
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="customRatio"
                    className="block w-full border border-gray-700 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-800 text-gray-200"
                    placeholder={`e.g., ${Array(treatmentCount).fill(0).map((_, i) => i === 0 ? '2' : '1').join(':')}`}
                    {...register('customRatioValue')}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  Use format like 2:1 (twice as many in control) or 1:2:1 (middle group gets twice as many)
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Visual representation of assignment */}
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-300">Assignment Preview</h3>
          <div className="mt-2 h-8 w-full bg-gray-800 border border-gray-700 rounded-md overflow-hidden flex">
            {renderAssignmentPreview()}
          </div>
          <p className="mt-1 text-xs text-gray-400">
            Visual representation of how participants will be distributed between groups
          </p>
        </div>
        
        {/* Reference to integration with experiments-engine */}
        <div className="mt-4 p-3 bg-gray-800 border border-gray-700 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-300">About Randomization</h3>
              <div className="mt-1 text-sm text-gray-400">
                <p>Proper randomization is crucial for valid causal inference. Your choice should balance:</p>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>Statistical power (ability to detect effects)</li>
                  <li>Balance between groups on important characteristics</li>
                  <li>Practical implementation constraints</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
      </form>
    </div>
  );
}