import { useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import ExperimentContext from '../../context/ExperimentContext';
import AISuggestion from '../AISuggestion';
import Tooltip from '../Tooltip';
import { getExperimentTitleSuggestions } from '../../../services/aiSuggestionService';

// This component demonstrates how AI assistance would enhance the existing BasicInfo step
// in experiments-engine while maintaining the current functionality
export default function BasicInfo({ goToNext }) {
  // In actual integration, we would use the Zustand store pattern from experiments-engine:
  // const { experimentState, updateName, updateDescription, updateMethodType } = useExperimentStore();
  const { experimentData, updateExperimentData } = useContext(ExperimentContext);
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      // Changed "title" to "name" to match experiments-engine terminology
      name: experimentData.title || '',
      description: experimentData.description || '',
      domain: experimentData.domain || 'default',
      focus: experimentData.focus || '',
      experimentType: experimentData.experimentType || 'mab' // Added experiment type
    }
  });
  
  const domain = watch('domain');
  const focus = watch('focus');
  const experimentType = watch('experimentType');
  
  const [nameSuggestions, setNameSuggestions] = useState({
    loading: false,
    suggestions: [],
    showSuggestions: false
  });
  
  // Function to get title suggestions when button is clicked
  const fetchNameSuggestions = async () => {
    // Don't proceed if focus is empty or too short
    if (!focus || focus.length < 3) {
      alert("Please enter a focus for your experiment (at least 3 characters)");
      return;
    }
    
    setNameSuggestions(prev => ({ ...prev, loading: true, showSuggestions: true }));
    
    try {
      // Modified to include experiment type in suggestion generation
      const suggestions = await getExperimentTitleSuggestions(domain, focus, experimentType);
      setNameSuggestions({
        loading: false,
        suggestions: suggestions,
        showSuggestions: true
      });
    } catch (error) {
      console.error("Error fetching name suggestions:", error);
      setNameSuggestions({
        loading: false,
        suggestions: [
          `${experimentType.toUpperCase()}: ${focus} in ${domain}`,
          `${domain} ${focus} Analysis`,
          `${focus} Improvement Study`
        ],
        showSuggestions: true
      });
    }
  };
  
  const onSubmit = (data) => {
    // In actual integration, this would be:
    // updateName(data.name);
    // updateDescription(data.description);
    // updateMethodType(data.experimentType);
    updateExperimentData({
      title: data.name,
      description: data.description,
      domain: data.domain,
      focus: data.focus,
      experimentType: data.experimentType
    });
    
    if (goToNext) {
      goToNext();
    }
  };
  
  const applyNameSuggestion = (name) => {
    setValue('name', name);
    setNameSuggestions(prev => ({ ...prev, showSuggestions: false }));
  };
  
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-100">Basic Information</h2>
      <p className="text-gray-400 mt-1">Let's get started with the basic details of your experiment</p>
      
      <form id="basic-form" onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6 px-4">
        {/* Added experiment type selection */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-300">
            Experiment Type
            <Tooltip content="The statistical approach for your experiment" />
          </label>
          <select
            {...register('experimentType')}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-gray-200 border-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-gray-800"
          >
            <option value="mab">Multi-Armed Bandit (MAB)</option>
            <option value="cmab">Contextual MAB</option>
            <option value="bayesian_ab">Bayesian A/B Test</option>
          </select>
          {experimentType === 'mab' && (
            <p className="mt-1 text-xs text-gray-400">
              Multi-Armed Bandit experiments adaptively allocate participants to different treatments, optimizing for rewards over time.
            </p>
          )}
          {experimentType === 'cmab' && (
            <p className="mt-1 text-xs text-gray-400">
              Contextual MABs consider participant characteristics when making assignment decisions.
            </p>
          )}
          {experimentType === 'bayesian_ab' && (
            <p className="mt-1 text-xs text-gray-400">
              Bayesian A/B tests use prior knowledge and continuously update probabilities as data comes in.
            </p>
          )}
        </div>
        
        <div>
          <label className="flex items-center text-sm font-medium text-gray-300">
            Experiment Domain
            <Tooltip content="The field or sector your experiment belongs to" />
          </label>
          <select
            {...register('domain')}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-gray-200 border-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-gray-800"
          >
            <option value="default">General</option>
            <option value="education">Education</option>
            <option value="healthcare">Healthcare</option>
            <option value="financial">Financial Inclusion</option>
          </select>
        </div>
        
        <div>
          <label className="flex items-center text-sm font-medium text-gray-300">
            What's the focus of your experiment?
            <Tooltip content="The main aspect or intervention you're studying" />
          </label>
          <input
            type="text"
            {...register('focus', { required: 'Please provide the focus of your experiment' })}
            className="mt-1 block w-full border border-gray-700 rounded-md shadow-sm py-2 px-3 sm:text-sm bg-gray-800 text-gray-200"
            placeholder="e.g., SMS Reminders, Gamification, Incentives"
          />
          {errors.focus && (
            <p className="mt-1 text-sm text-red-400">{errors.focus.message}</p>
          )}
        </div>
        
        <div>
          <label className="flex items-center text-sm font-medium text-gray-300">
            Experiment Name
            <Tooltip content="A clear, descriptive name for your experiment" />
          </label>
          <div className="flex mt-1">
            <input
              type="text"
              {...register('name', { required: 'Name is required' })}
              className="block w-full border border-gray-700 rounded-md rounded-r-none shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-800 text-gray-200"
              placeholder="e.g., Impact of SMS Reminders on Savings Behavior"
            />
            <button
              type="button"
              onClick={fetchNameSuggestions}
              className="inline-flex items-center px-4 py-2 border border-l-0 border-gray-700 text-sm font-medium rounded-r-md text-blue-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={nameSuggestions.loading}
            >
              {nameSuggestions.loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Thinking...
                </span>
              ) : (
                'AI Suggest Name'
              )}
            </button>
          </div>
          {errors.name && (
            <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
          )}
          
          {nameSuggestions.showSuggestions && (
            <div className="mt-2">
              <AISuggestion
                suggestion={`Here are some name suggestions for your ${experimentType.toUpperCase()} experiment`}
                explanation={`A good ${experimentType.toUpperCase()} experiment name should clearly indicate what you're testing and be specific enough to differentiate your experiment.`}
                onAccept={() => {}}
                loading={nameSuggestions.loading}
                multiSuggestion={true}
              />
              
              {!nameSuggestions.loading && (
                <div className="mt-3 space-y-2">
                  {nameSuggestions.suggestions.map((name, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => applyNameSuggestion(name)}
                        className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded-md text-blue-300 bg-blue-900 hover:bg-blue-800"
                      >
                        Use: {name}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        
        <div>
          <label className="flex items-center text-sm font-medium text-gray-300">
            Description
            <Tooltip content="A brief summary of what you're testing and why" />
          </label>
          <textarea
            rows={4}
            {...register('description', { required: 'Description is required' })}
            className="mt-1 block w-full border border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-800 text-gray-200"
            placeholder="Describe the purpose and hypothesis of your experiment..."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-400">{errors.description.message}</p>
          )}
        </div>
        
        <div className="p-4 bg-gray-800 border border-gray-700 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-300">Tips for effective {experimentType === 'mab' ? 'MAB' : experimentType === 'cmab' ? 'CMAB' : 'Bayesian A/B'} experiments</h3>
              <div className="mt-2 text-sm text-blue-200">
                <ul className="list-disc pl-5 space-y-1">
                  {experimentType === 'mab' && (
                    <>
                      <li>Define clear rewards that reflect your business objectives</li>
                      <li>Choose appropriate priors based on your domain knowledge</li>
                      <li>Consider the exploration-exploitation tradeoff</li>
                      <li>Plan how long your experiment needs to run</li>
                    </>
                  )}
                  {experimentType === 'cmab' && (
                    <>
                      <li>Identify relevant contextual variables that may affect outcomes</li>
                      <li>Ensure context variables are available at decision time</li>
                      <li>Select appropriate context features to avoid overfitting</li>
                      <li>Consider how context influences which arm performs best</li>
                    </>
                  )}
                  {experimentType === 'bayesian_ab' && (
                    <>
                      <li>Define a clear success metric before starting</li>
                      <li>Set appropriate priors based on existing knowledge</li>
                      <li>Consider appropriate sample sizes for reliable results</li>
                      <li>Determine stopping criteria based on posterior probability</li>
                    </>
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