import { useContext } from 'react';
import ExperimentContext from '../../context/ExperimentContext';

export default function Review() {
  const { experimentData } = useContext(ExperimentContext);

  return (
    <div>
      <h2 className="text-xl font-semibold">Review Experiment Design</h2>
      <p className="text-gray-600 mt-1">Confirm all settings before creating your experiment</p>
      
      <div className="mt-6 space-y-6">
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="font-medium text-gray-900">Basic Information</h3>
          <div className="mt-2 grid grid-cols-1 gap-y-3">
            <div>
              <span className="text-sm font-medium text-gray-500">Title:</span>
              <p className="mt-1 text-sm text-gray-900">{experimentData.title || 'Not set'}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Description:</span>
              <p className="mt-1 text-sm text-gray-900">{experimentData.description || 'Not set'}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Domain:</span>
              <p className="mt-1 text-sm text-gray-900">{experimentData.domain || 'Not set'}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="font-medium text-gray-900">Randomization</h3>
          <div className="mt-2 grid grid-cols-1 gap-y-3">
            <div>
              <span className="text-sm font-medium text-gray-500">Method:</span>
              <p className="mt-1 text-sm text-gray-900">{experimentData.randomizationMethod || 'Not set'}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Treatment Groups:</span>
              <div className="mt-1">
                {experimentData.treatmentGroups.length > 0 ? (
                  <ul className="list-disc list-inside text-sm text-gray-900">
                    {experimentData.treatmentGroups.map((group, i) => (
                      <li key={i}>{group}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-900">No treatment groups defined</p>
                )}
              </div>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Assignment Ratio:</span>
              <p className="mt-1 text-sm text-gray-900">{experimentData.assignmentRatio || 'Not set'}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="font-medium text-gray-900">Sample Size</h3>
          <div className="mt-2 grid grid-cols-1 gap-y-3">
            <div>
              <span className="text-sm font-medium text-gray-500">Total Sample Size:</span>
              <p className="mt-1 text-sm text-gray-900">{experimentData.sampleSize || 'Not set'}</p>
            </div>
            {experimentData.powerCalculation && (
              <>
                <div>
                  <span className="text-sm font-medium text-gray-500">Minimum Detectable Effect:</span>
                  <p className="mt-1 text-sm text-gray-900">{experimentData.powerCalculation.mde}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Statistical Power:</span>
                  <p className="mt-1 text-sm text-gray-900">{experimentData.powerCalculation.power}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Significance Level (α):</span>
                  <p className="mt-1 text-sm text-gray-900">{experimentData.powerCalculation.alpha}</p>
                </div>
              </>
            )}
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="font-medium text-gray-900">Variables & Metrics</h3>
          <div className="mt-2">
            {experimentData.variables.length > 0 ? (
              <ul className="list-disc list-inside text-sm text-gray-900">
                {experimentData.variables.map((variable, i) => (
                  <li key={i}>{variable}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-900">No variables defined</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Confirm experiment details</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                Please verify all the experiment details are correct before proceeding. Once created, some settings cannot be easily modified.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}