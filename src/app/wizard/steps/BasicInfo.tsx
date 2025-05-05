import { useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import ExperimentContext from '../../context/ExperimentContext';
import AISuggestion from '../AISuggestion';
import Tooltip from '../Tooltip';
import { getExperimentTitleSuggestions } from '../../../services/aiSuggestionService';

export default function BasicInfo() {
  const { experimentData, updateExperimentData } = useContext(ExperimentContext);
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      title: experimentData.title || '',
      description: experimentData.description || '',
      domain: experimentData.domain || 'default',
      focus: experimentData.focus || ''
    }
  });
  
  const domain = watch('domain');
  const focus = watch('focus');
  
  const [titleSuggestions, setTitleSuggestions] = useState({
    loading: false,
    suggestions: [],
    showSuggestions: false
  });
  
  // Function to get title suggestions when button is clicked
  const fetchTitleSuggestions = async () => {
    // Don't proceed if focus is empty or too short
    if (!focus || focus.length < 3) {
      alert("Please enter a focus for your experiment (at least 3 characters)");
      return;
    }
    
    setTitleSuggestions(prev => ({ ...prev, loading: true, showSuggestions: true }));
    
    try {
      const suggestions = await getExperimentTitleSuggestions(domain, focus);
      setTitleSuggestions({
        loading: false,
        suggestions: suggestions,
        showSuggestions: true
      });
    } catch (error) {
      console.error("Error fetching title suggestions:", error);
      setTitleSuggestions({
        loading: false,
        suggestions: [
          `Impact Study on ${focus} in ${domain}`,
          `${domain} ${focus} Analysis`,
          `${focus} Improvement Research`
        ],
        showSuggestions: true
      });
    }
  };
  
  const onSubmit = (data) => {
    updateExperimentData({
      title: data.title,
      description: data.description,
      domain: data.domain,
      focus: data.focus
    });
    // Progression to next step is handled by parent component
  };
  
  const applyTitleSuggestion = (title) => {
    setValue('title', title);
    setTitleSuggestions(prev => ({ ...prev, showSuggestions: false }));
  };
  
  return (
    <div>
      <h2 className="text-xl font-semibold">Basic Information</h2>
      <p className="text-gray-600 mt-1">Let's get started with the basic details of your experiment</p>
      
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700">
            Experiment Domain
            <Tooltip content="The field or sector your experiment belongs to" />
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
            What's the focus of your experiment?
            <Tooltip content="The main aspect or intervention you're studying" />
          </label>
          <input
            type="text"
            {...register('focus', { required: 'Please provide the focus of your experiment' })}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="e.g., SMS Reminders, Gamification, Incentives"
          />
          {errors.focus && (
            <p className="mt-1 text-sm text-red-600">{errors.focus.message}</p>
          )}
        </div>
        
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700">
            Experiment Title
            <Tooltip content="A clear, descriptive name for your experiment" />
          </label>
          <div className="flex mt-1">
            <input
              type="text"
              {...register('title', { required: 'Title is required' })}
              className="block w-full border border-gray-300 rounded-md rounded-r-none shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="e.g., Impact of SMS Reminders on Savings Behavior"
            />
            <button
              type="button"
              onClick={fetchTitleSuggestions}
              className="inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 text-sm font-medium rounded-r-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={titleSuggestions.loading}
            >
              {titleSuggestions.loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Thinking...
                </span>
              ) : (
                'AI Suggest Title'
              )}
            </button>
          </div>
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
          
          {titleSuggestions.showSuggestions && (
            <div className="mt-2">
              <AISuggestion
                suggestion="Here are some title suggestions based on your experiment focus"
                explanation="A good title should clearly indicate what you're testing and be specific enough to differentiate your experiment."
                onAccept={() => {}}
                loading={titleSuggestions.loading}
              />
              
              {!titleSuggestions.loading && (
                <div className="mt-3 space-y-2">
                  {titleSuggestions.suggestions.map((title, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => applyTitleSuggestion(title)}
                        className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                      >
                        Use: {title}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700">
            Description
            <Tooltip content="A brief summary of what you're testing and why" />
          </label>
          <textarea
            rows={4}
            {...register('description', { required: 'Description is required' })}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Describe the purpose and hypothesis of your experiment..."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>
        
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Tips for effective experiments</h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Define a clear, testable hypothesis</li>
                  <li>Focus on a single variable to change</li>
                  <li>Identify measurable outcomes</li>
                  <li>Consider potential confounding factors</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}