import { useContext, useState, useEffect } from 'react';
import ExperimentContext from '../../context/ExperimentContext';
import AISuggestion from '../AISuggestion';
import Tooltip from '../Tooltip';

export default function Review() {
  const { experimentData } = useContext(ExperimentContext);
  const [validationResults, setValidationResults] = useState({
    loading: true,
    issues: [],
    suggestions: [],
    score: 0
  });
  
  useEffect(() => {
    const validateExperiment = async () => {
      setTimeout(() => {
        const issues = [];
        const suggestions = [];
        let score = 100; 
        
        if (!experimentData.sampleSize) {
          issues.push("Sample size not specified");
          score -= 20;
        } else if (experimentData.sampleSize < 100 && experimentData.experimentType === 'mab') {
          issues.push("Sample size may be too small for a reliable MAB experiment");
          score -= 10;
        }
        
        if (!experimentData.variables || experimentData.variables.length === 0) {
          issues.push("No variables defined");
          score -= 20;
        } else if (experimentData.experimentType === 'cmab' && 
                   !experimentData.variables.some(v => v.type === 'context')) {
          issues.push("CMAB experiment requires context variables");
          score -= 15;
        }
        
        if (experimentData.experimentType === 'mab') {
          suggestions.push("Consider defining clear stopping criteria for your experiment");
        } else if (experimentData.experimentType === 'cmab') {
          suggestions.push("Ensure your context variables are available at decision time");
        } else if (experimentData.experimentType === 'bayesian_ab') {
          suggestions.push("Consider setting informative priors based on domain knowledge");
        }
        
        setValidationResults({
          loading: false,
          issues,
          suggestions,
          score: Math.max(0, score)
        });
      }, 1500);
    };
    
    validateExperiment();
  }, [experimentData]);
  
  const getExperimentTypeBadge = (type) => {
    switch (type) {
      case 'mab':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-900 text-blue-200">MAB</span>;
      case 'cmab':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-purple-900 text-purple-200">CMAB</span>;
      case 'bayesian_ab':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-green-900 text-green-200">Bayesian A/B</span>;
      default:
        return null;
    }
  };
  
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
  
  const renderAssignmentPreview = () => {
    const treatmentCount = experimentData.treatmentGroups?.length || 2;
    
    if (experimentData.assignmentRatio === 'equal') {
      return (
        <>
          {Array(treatmentCount).fill(0).map((_, i) => (
            <div 
              key={i}
              className={`h-full ${i === 0 ? 'bg-gray-600' : 'bg-blue-600'}`} 
              style={{ width: `${100 / treatmentCount}%` }}
            >
              <div className="h-full flex items-center justify-center text-xs text-white font-medium">
                {i === 0 ? 'C' : `T${i}`}
              </div>
            </div>
          ))}
        </>
      );
    } else if (experimentData.customRatioValue) {
      try {
        const parts = experimentData.customRatioValue.split(':').map(Number);
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
                  {i === 0 ? 'C' : `T${i}`}
                </div>
              </div>
            ))}
          </>
        );
      } catch (e) {
        return (
          <div className="h-full w-full bg-gray-700 flex items-center justify-center text-xs text-white">
            Custom ratio
          </div>
        );
      }
    } else {
      return (
        <div className="h-full w-full bg-gray-700 flex items-center justify-center text-xs text-white">
          Not specified
        </div>
      );
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-100">Review Experiment Design</h2>
      <p className="text-gray-400 mt-1">Confirm all settings before creating your experiment</p>
      
      <div className="mt-4 px-4">
        <div className="bg-gray-800 rounded-md border border-gray-700 overflow-hidden">
          <div className="p-4">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
                <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" />
                <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" />
              </svg>
              <h3 className="ml-2 text-md font-medium text-blue-400">AI Design Review</h3>
              {!validationResults.loading && (
                <div className="ml-auto flex items-center">
                  <span className="text-sm text-gray-400 mr-2">Quality Score:</span>
                  <span className={`font-bold text-sm ${
                    validationResults.score > 80 ? 'text-green-400' : 
                    validationResults.score > 50 ? 'text-yellow-400' : 'text-red-400'
                  }`}>{validationResults.score}/100</span>
                </div>
              )}
            </div>
            
            {validationResults.loading ? (
              <div className="mt-3 flex items-center justify-center py-4">
                <svg className="animate-spin h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="ml-2 text-sm text-gray-300">Analyzing experiment design...</span>
              </div>
            ) : (
              <div className="mt-3">
                {validationResults.issues.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-red-400">Issues to address:</h4>
                    <ul className="mt-1 list-disc list-inside text-sm text-gray-300">
                      {validationResults.issues.map((issue, index) => (
                        <li key={index} className="text-red-300">{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {validationResults.suggestions.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-blue-400">Suggestions to consider:</h4>
                    <ul className="mt-1 list-disc list-inside text-sm text-gray-300">
                      {validationResults.suggestions.map((suggestion, index) => (
                        <li key={index} className="text-blue-300">{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {validationResults.issues.length === 0 && validationResults.suggestions.length === 0 && (
                  <p className="text-sm text-green-400">Your experiment design looks good! No issues detected.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-6 space-y-6 px-4">
        <div className="bg-gray-800 p-4 rounded-md border border-gray-700">
          <div className="flex justify-between items-start">
            <h3 className="font-medium text-gray-200">Basic Information</h3>
            {experimentData.experimentType && getExperimentTypeBadge(experimentData.experimentType)}
          </div>
          <div className="mt-2 grid grid-cols-1 gap-y-3">
            <div>
              <span className="text-sm font-medium text-gray-400">Title:</span>
              <p className="mt-1 text-sm text-gray-200">{experimentData.title || 'Not set'}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-400">Description:</span>
              <p className="mt-1 text-sm text-gray-200">{experimentData.description || 'Not set'}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-400">Domain:</span>
              <p className="mt-1 text-sm text-gray-200">{experimentData.domain || 'Not set'}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-400">Focus:</span>
              <p className="mt-1 text-sm text-gray-200">{experimentData.focus || 'Not set'}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-md border border-gray-700">
          <h3 className="font-medium text-gray-200">Sample Size</h3>
          <div className="mt-2 grid grid-cols-1 gap-y-3">
            <div>
              <span className="text-sm font-medium text-gray-400">Total Sample Size:</span>
              <p className="mt-1 text-sm text-gray-200">{experimentData.sampleSize || 'Not set'}</p>
              
              {experimentData.sampleSize && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Small</span>
                    <span>Adequate</span>
                    <span>Large</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${
                        experimentData.sampleSize < 100 ? 'bg-red-500' :
                        experimentData.sampleSize < 300 ? 'bg-yellow-500' :
                        experimentData.sampleSize < 1000 ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min(100, experimentData.sampleSize / 10)}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
            {experimentData.powerCalculation && (
              <>
                <div>
                  <span className="text-sm font-medium text-gray-400">Minimum Detectable Effect:</span>
                  <p className="mt-1 text-sm text-gray-200">{experimentData.powerCalculation.mde}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-400">Statistical Power:</span>
                  <p className="mt-1 text-sm text-gray-200">{experimentData.powerCalculation.power}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-400">Significance Level (α):</span>
                  <p className="mt-1 text-sm text-gray-200">{experimentData.powerCalculation.alpha}</p>
                </div>
              </>
            )}
          </div>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-md border border-gray-700">
          <h3 className="font-medium text-gray-200">Randomization</h3>
          <div className="mt-2 grid grid-cols-1 gap-y-3">
            <div>
              <span className="text-sm font-medium text-gray-400">Method:</span>
              <p className="mt-1 text-sm text-gray-200">{experimentData.randomizationMethod || 'Not set'}</p>
              
              {experimentData.randomizationMethod === 'simple' && (
                <p className="mt-1 text-xs text-gray-400">Simple randomization assigns participants completely at random, like flipping a coin.</p>
              )}
              {experimentData.randomizationMethod === 'stratified' && (
                <p className="mt-1 text-xs text-gray-400">Stratified randomization ensures balance across important variables like gender or age group.</p>
              )}
              {experimentData.randomizationMethod === 'cluster' && (
                <p className="mt-1 text-xs text-gray-400">Cluster randomization assigns groups (e.g., schools, villages) rather than individuals.</p>
              )}
            </div>
            <div>
              <span className="text-sm font-medium text-gray-400">Treatment Groups:</span>
              <div className="mt-1">
                {experimentData.treatmentGroups && experimentData.treatmentGroups.length > 0 ? (
                  <ul className="list-disc list-inside text-sm text-gray-200">
                    {experimentData.treatmentGroups.map((group, i) => (
                      <li key={i}>{group}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-200">No treatment groups defined</p>
                )}
              </div>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-400">Assignment Ratio:</span>
              <p className="mt-1 text-sm text-gray-200">
                {experimentData.assignmentRatio === 'equal' 
                  ? 'Equal (1:1)' 
                  : experimentData.customRatioValue 
                    ? `Custom (${experimentData.customRatioValue})` 
                    : 'Not set'}
              </p>
              
              <div className="mt-2">
                <div className="h-6 w-full bg-gray-700 rounded-md overflow-hidden flex">
                  {renderAssignmentPreview()}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-md border border-gray-700">
          <h3 className="font-medium text-gray-200">Variables & Metrics</h3>
          <div className="mt-2">
            {experimentData.variables && experimentData.variables.length > 0 ? (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-400">Outcome Variables:</h4>
                  <ul className="mt-1 space-y-1">
                    {experimentData.variables
                      .filter(v => v.type === 'outcome' || !v.type)
                      .map((variable, i) => (
                        <li key={i} className="flex items-center text-sm text-gray-200">
                          <span className="text-blue-400 mr-1">•</span>
                          {variable.name || variable}
                          {variable.dataType && (
                            <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getDataTypeBadge(variable.dataType)}`}>
                              {variable.dataType}
                            </span>
                          )}
                        </li>
                      ))}
                  </ul>
                </div>
                
                {experimentData.experimentType === 'cmab' && experimentData.variables.some(v => v.type === 'context') && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-400">Context Variables:</h4>
                    <ul className="mt-1 space-y-1">
                      {experimentData.variables
                        .filter(v => v.type === 'context')
                        .map((variable, i) => (
                          <li key={i} className="flex items-center text-sm text-gray-200">
                            <span className="text-purple-400 mr-1">•</span>
                            {variable.name}
                            {variable.dataType && (
                              <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getDataTypeBadge(variable.dataType)}`}>
                                {variable.dataType}
                              </span>
                            )}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-200">No variables defined</p>
            )}
          </div>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-md border border-gray-700">
          <h3 className="font-medium text-gray-200">Experiment Execution Guide</h3>
          <div className="mt-2 text-sm text-gray-300">
            {experimentData.experimentType === 'mab' && (
              <div>
                <p>For your Multi-Armed Bandit experiment:</p>
                <ul className="list-disc list-inside mt-2 text-gray-400 space-y-1">
                  <li>Start with an exploration phase to gather initial data on all arms</li>
                  <li>Implement the adaptive allocation algorithm as specified</li>
                  <li>Monitor arm performance regularly</li>
                  <li>Consider setting a stopping rule based on confidence intervals</li>
                </ul>
              </div>
            )}
            {experimentData.experimentType === 'cmab' && (
              <div>
                <p>For your Contextual Multi-Armed Bandit experiment:</p>
                <ul className="list-disc list-inside mt-2 text-gray-400 space-y-1">
                  <li>Collect context variables before making treatment assignments</li>
                  <li>Use the context to inform the assignment decision for each participant</li>
                  <li>Ensure your model is updated with new outcome data regularly</li>
                  <li>Monitor how different contexts affect arm performance</li>
                </ul>
              </div>
            )}
            {experimentData.experimentType === 'bayesian_ab' && (
              <div>
                <p>For your Bayesian A/B test:</p>
                <ul className="list-disc list-inside mt-2 text-gray-400 space-y-1">
                  <li>Set informative priors if you have prior knowledge about expected effects</li>
                  <li>Update your posterior distributions as data comes in</li>
                  <li>Consider specifying a decision rule based on posterior probabilities</li>
                  <li>Monitor the experiment until your stopping criterion is met</li>
                </ul>
              </div>
            )}
            {!experimentData.experimentType && (
              <p>Please select an experiment type to see specific execution guidance.</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-gray-800 border border-gray-700 rounded-md mx-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-300">Confirm experiment details</h3>
            <div className="mt-2 text-sm text-yellow-200">
              <p>
                Please verify all the experiment details are correct before proceeding. Once created, some settings cannot be easily modified.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 flex justify-end px-4">
        <div className="flex space-x-3">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-gray-700 text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Export as PDF
          </button>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Create Experiment
          </button>
        </div>
      </div>
    </div>
  );
}