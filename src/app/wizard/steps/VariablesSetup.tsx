import { useContext, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import ExperimentContext from '../../context/ExperimentContext';
import AISuggestion from '../AISuggestion';
import Tooltip from '../Tooltip';
import { getVariableSuggestions } from '../../../services/aiSuggestionService';

// This component demonstrates how AI assistance would enhance the existing variables setup
// in experiments-engine while maintaining the current functionality
export default function VariablesSetup({ goToNext }) {
  // In actual integration, we would use the Zustand store pattern from experiments-engine:
  // const { experimentState, updateContexts, updateVariables } = useExperimentStore();
  const { experimentData, updateExperimentData } = useContext(ExperimentContext);
  
  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      newVariable: '',
      variableType: 'outcome', // outcome or context
      variableDataType: 'numeric', // numeric, categorical, binary
      domain: experimentData.domain || 'default'
    }
  });
  
  // In this enhanced version, we track variable type and data type
  const [variables, setVariables] = useState(experimentData.variables || []);
  const [aiSuggestions, setAiSuggestions] = useState({
    loading: true,
    outcomes: [],
    contexts: []
  });
  
  const domain = experimentData.domain || watch('domain');
  const experimentType = experimentData.experimentType || 'mab';
  const variableType = watch('variableType');
  const variableDataType = watch('variableDataType');
  
  // Get AI suggestions when domain or experiment type changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      setAiSuggestions(prev => ({ ...prev, loading: true }));
      
      try {
        const suggestions = await getVariableSuggestions(experimentData.title || '', domain, experimentType);
        
        // In a real implementation, the API would return categorized variables
        // Here we simulate this with some basic logic
        let outcomes = suggestions.filter((_, i) => i % 3 !== 0);
        let contexts = suggestions.filter((_, i) => i % 3 === 0);
        
        if (experimentType === 'cmab') {
          // For CMAB, ensure we have context suggestions
          contexts = contexts.length ? contexts : ['Location', 'Age Group', 'Time of Day'];
        }
        
        setAiSuggestions({
          loading: false,
          outcomes,
          contexts
        });
      } catch (error) {
        console.error("Error fetching AI variable suggestions:", error);
        // Fallback to basic suggestions
        setAiSuggestions({
          loading: false,
          outcomes: ['Engagement', 'Satisfaction', 'Conversion Rate'],
          contexts: ['Location', 'Age Group', 'Time of Day']
        });
      }
    };
    
    fetchSuggestions();
  }, [domain, experimentData.title, experimentType]);
  
  const onSubmit = (data) => {
    // In actual integration, this would be:
    // updateVariables(variables.filter(v => v.type === 'outcome'));
    // if (experimentType === 'cmab') {
    //   updateContexts(variables.filter(v => v.type === 'context'));  
    // }
    
    // Update experiment context with current variables
    updateExperimentData({
      variables,
      domain: data.domain
    });
    
    if (goToNext) {
      goToNext();
    }
  };
  
  const addVariable = () => {
    const newVar = watch('newVariable').trim();
    if (!newVar) return;
    
    // Check for duplicates
    if (variables.some(v => v.name === newVar)) {
      alert("This variable already exists");
      return;
    }
    
    // Add the new variable with type information
    setVariables([
      ...variables, 
      {
        name: newVar,
        type: variableType,
        dataType: variableDataType
      }
    ]);
    
    setValue('newVariable', '');
  };
  
  const removeVariable = (index) => {
    setVariables(variables.filter((_, i) => i !== index));
  };
  
  const addSuggestedVariable = (variable, type) => {
    if (variables.some(v => v.name === variable)) return;
    
    // Determine data type based on variable name (simplified logic)
    let dataType = 'numeric';
    if (variable.includes('Rate') || variable.includes('Percentage')) {
      dataType = 'numeric';
    } else if (variable.includes('Category') || variable.includes('Type')) {
      dataType = 'categorical';
    } else if (variable.includes('Is') || variable.includes('Has')) {
      dataType = 'binary';
    }
    
    setVariables([
      ...variables, 
      {
        name: variable,
        type: type,
        dataType: dataType
      }
    ]);
  };
  
  // Group variables by type
  const outcomeVariables = variables.filter(v => v.type === 'outcome');
  const contextVariables = variables.filter(v => v.type === 'context');
  
  // Define badge colors for different data types
  const getDataTypeBadge = (dataType) => {
    switch (dataType) {
      case 'numeric':
        return 'bg-blue-900 text-blue-300';
      case 'categorical':
        return 'bg-purple-900 text-purple-300';
      case 'binary':
        return 'bg-green-900 text-green-300';
      default:
        return 'bg-gray-700 text-gray-300';
    }
  };
  
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-100">Variables & Metrics Setup</h2>
      <p className="text-gray-400 mt-1">Define the key variables you'll measure in your experiment</p>
      
      {/* Contextual explanation based on experiment type */}
      <div className="mt-3 p-3 bg-gray-800 border border-gray-700 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-300">Setting Up Your {experimentType.toUpperCase()} Variables</h3>
            <div className="mt-1 text-sm text-gray-400">
              {experimentType === 'mab' && (
                <p>For a Multi-Armed Bandit experiment, you need to define outcome variables to measure the success of each treatment arm.</p>
              )}
              {experimentType === 'cmab' && (
                <p>For Contextual MAB experiments, define both outcome variables (what you're measuring) and context variables (factors that may influence outcomes).</p>
              )}
              {experimentType === 'bayesian_ab' && (
                <p>For your Bayesian A/B test, define the primary and secondary outcome variables that you'll use to evaluate treatment effects.</p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <form id='variables-form' onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6 px-4">
        
        
        <div>
          <label className="flex items-center text-sm font-medium text-gray-300">
            Add New Variable
            <Tooltip content="Define what you'll measure or which contextual factors you'll consider" />
          </label>
          
          <div className="mt-2">
            <div className="flex mb-2">
              <select
                {...register('variableType')}
                className="w-1/3 pl-3 pr-10 py-2 text-gray-200 border-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-gray-800"
              >
                <option value="outcome">Outcome Variable</option>
                {experimentType === 'cmab' && (
                  <option value="context">Context Variable</option>
                )}
              </select>
              
              <select
                {...register('variableDataType')}
                className="ml-2 w-1/3 pl-3 pr-10 py-2 text-gray-200 border-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-gray-800"
              >
                <option value="numeric">Numeric</option>
                <option value="categorical">Categorical</option>
                <option value="binary">Binary (Yes/No)</option>
              </select>
            </div>
            
            <div className="flex">
              <input
                type="text"
                {...register('newVariable')}
                placeholder={variableType === 'outcome' ? "e.g., Conversion Rate" : "e.g., Age Group"}
                className="flex-1 block w-full border border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-800 text-gray-200"
              />
              <button
                type="button"
                onClick={addVariable}
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Add
              </button>
            </div>
            
            <div className="mt-1 text-xs text-gray-400">
              {variableType === 'outcome' ? (
                <p>Outcome variables measure the effect of your experiment (e.g., click rate, completion time)</p>
              ) : (
                <p>Context variables are participant characteristics that might affect outcomes (e.g., location, age group)</p>
              )}
            </div>
          </div>
          
          {/* Outcome Variables Section */}
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-300">Outcome Variables:</h4>
            {outcomeVariables.length > 0 ? (
              <ul className="mt-2 space-y-2">
                {outcomeVariables.map((variable, index) => (
                  <li key={index} className="flex items-center justify-between bg-gray-800 px-3 py-2 rounded-md border border-gray-700">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-200">{variable.name}</span>
                      <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getDataTypeBadge(variable.dataType)}`}>
                        {variable.dataType}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeVariable(variables.indexOf(variable))}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-gray-500 italic">No outcome variables defined yet</p>
            )}
          </div>
          
          {/* Context Variables Section - Only show for CMAB */}
          {experimentType === 'cmab' && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-300">
                Context Variables:
                <Tooltip content="These variables will be used to make context-aware treatment assignments" />
              </h4>
              {contextVariables.length > 0 ? (
                <ul className="mt-2 space-y-2">
                  {contextVariables.map((variable, index) => (
                    <li key={index} className="flex items-center justify-between bg-gray-800 px-3 py-2 rounded-md border border-gray-700">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-200">{variable.name}</span>
                        <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getDataTypeBadge(variable.dataType)}`}>
                          {variable.dataType}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeVariable(variables.indexOf(variable))}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-gray-500 italic">No context variables defined yet</p>
              )}
            </div>
          )}
          
          {/* AI Suggestions for Outcome Variables */}
          <div className="mt-6">
            <AISuggestion
              suggestion={`Recommended outcome variables for ${domain} experiments`}
              explanation="These variables are commonly used in similar experiments and can help you measure important outcomes."
              onAccept={() => {}}
              loading={aiSuggestions.loading}
              multiSuggestion={true}
            />
            
            {!aiSuggestions.loading && (
              <div className="mt-3 space-y-2">
                {aiSuggestions.outcomes.map((variable, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => addSuggestedVariable(variable, 'outcome')}
                      disabled={variables.some(v => v.name === variable)}
                      className={`inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded-md ${
                        variables.some(v => v.name === variable)
                          ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                          : 'text-blue-300 bg-blue-900 hover:bg-blue-800'
                      }`}
                    >
                      {variables.some(v => v.name === variable) ? 'Added' : 'Add'} {variable}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* AI Suggestions for Context Variables - Only for CMAB */}
          {experimentType === 'cmab' && (
            <div className="mt-6">
              <AISuggestion
                suggestion="Recommended context variables for your experiment"
                explanation="These contextual factors may influence how your treatments perform across different user segments."
                onAccept={() => {}}
                loading={aiSuggestions.loading}
                multiSuggestion={true}
              />
              
              {!aiSuggestions.loading && (
                <div className="mt-3 space-y-2">
                  {aiSuggestions.contexts.map((variable, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => addSuggestedVariable(variable, 'context')}
                        disabled={variables.some(v => v.name === variable)}
                        className={`inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded-md ${
                          variables.some(v => v.name === variable)
                            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                            : 'text-blue-300 bg-blue-900 hover:bg-blue-800'
                        }`}
                      >
                        {variables.some(v => v.name === variable) ? 'Added' : 'Add'} {variable}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Educational guidance */}
          <div className="mt-6 p-3 bg-gray-800 border border-gray-700 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-300">Tips for selecting variables</h3>
                <ul className="mt-1 text-xs text-gray-400 space-y-1 list-disc pl-4">
                  <li>Choose variables that directly relate to your experiment goals</li>
                  <li>Include both primary outcomes (main focus) and secondary outcomes (additional insights)</li>
                  <li>For numeric variables, consider how you'll collect and analyze the data</li>
                  <li>For categorical variables, consider the number of possible categories</li>
                  {experimentType === 'cmab' && (
                    <li>Context variables should be known before treatment assignment</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}