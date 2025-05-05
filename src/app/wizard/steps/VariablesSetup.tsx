import { useContext, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import ExperimentContext from '../../context/ExperimentContext';
import AISuggestion from '../AISuggestion';
import Tooltip from '../Tooltip';
import { getVariableSuggestions } from '../../../services/aiSuggestionService';

export default function VariablesSetup() {
  const { experimentData, updateExperimentData } = useContext(ExperimentContext);
  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      newVariable: '',
      domain: experimentData.domain || 'default'
    }
  });
  
  const [variables, setVariables] = useState(experimentData.variables || []);
  const [aiSuggestions, setAiSuggestions] = useState({
    loading: true,
    variables: []
  });
  
  const domain = experimentData.domain || watch('domain');
  
  // Get AI suggestions when domain changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      setAiSuggestions(prev => ({ ...prev, loading: true }));
      
      try {
        const suggestions = await getVariableSuggestions(experimentData.title || '', domain);
        setAiSuggestions({
          loading: false,
          variables: suggestions
        });
      } catch (error) {
        console.error("Error fetching AI variable suggestions:", error);
        // Fallback to basic suggestions
        setAiSuggestions({
          loading: false,
          variables: ['Engagement', 'Satisfaction', 'Conversion Rate']
        });
      }
    };
    
    fetchSuggestions();
  }, [domain, experimentData.title]);
  
  const onSubmit = (data) => {
    // Update experiment context with current variables
    updateExperimentData({
      variables,
      domain: data.domain
    });
  };
  
  const addVariable = () => {
    const newVar = watch('newVariable').trim();
    if (newVar && !variables.includes(newVar)) {
      setVariables([...variables, newVar]);
      setValue('newVariable', '');
    }
  };
  
  const removeVariable = (index) => {
    setVariables(variables.filter((_, i) => i !== index));
  };
  
  const addSuggestedVariable = (variable) => {
    if (!variables.includes(variable)) {
      setVariables([...variables, variable]);
    }
  };
  
  return (
    <div>
      <h2 className="text-xl font-semibold">Variables & Metrics Setup</h2>
      <p className="text-gray-600 mt-1">Define the key variables you'll measure in your experiment</p>
      
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700">
            Experiment Domain
            <Tooltip content="The domain or field your experiment belongs to" />
          </label>
          <select
            {...register('domain')}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="default">General</option>
            <option value="education">Education</option>
            <option value="healthcare">Healthcare</option>
            <option value="financial">Financial Inclusion</option>
          </select>
        </div>
        
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700">
            Variables To Measure
            <Tooltip content="The outcomes or metrics you'll track to determine the experiment's impact" />
          </label>
          
          <div className="mt-2 flex">
            <input
              type="text"
              {...register('newVariable')}
              placeholder="Enter a variable"
              className="flex-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            <button
              type="button"
              onClick={addVariable}
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add
            </button>
          </div>
          
          {variables.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700">Current Variables:</h4>
              <ul className="mt-2 space-y-2">
                {variables.map((variable, index) => (
                  <li key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md">
                    <span className="text-sm text-gray-800">{variable}</span>
                    <button
                      type="button"
                      onClick={() => removeVariable(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="mt-5">
            <AISuggestion
              suggestion="We recommend including these variables based on your experiment domain"
              explanation="These variables are commonly used in similar experiments and can help you measure important outcomes."
              onAccept={() => {}}
              loading={aiSuggestions.loading}
            />
            
            {!aiSuggestions.loading && (
              <div className="mt-3 space-y-2">
                {aiSuggestions.variables.map((variable, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => addSuggestedVariable(variable)}
                      disabled={variables.includes(variable)}
                      className={`inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded-md ${
                        variables.includes(variable)
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'text-blue-700 bg-blue-100 hover:bg-blue-200'
                      }`}
                    >
                      {variables.includes(variable) ? 'Added' : 'Add'} {variable}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}