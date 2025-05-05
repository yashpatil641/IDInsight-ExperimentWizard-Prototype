"use client";	

import { createContext } from 'react';

// Define the shape of the experiment data
export interface ExperimentData {
  title: string;
  description: string;
  randomizationMethod: string;
  sampleSize: number | null;
  variables: string[];
  treatmentGroups: string[];
  domain?: string;
  focus?: string;
  powerCalculation?: {
    mde: number;
    power: number;
    alpha: number;
  };
  assignmentRatio?: string;
}

// Define the shape of the context
interface ExperimentContextType {
  experimentData: ExperimentData;
  updateExperimentData: (data: Partial<ExperimentData>) => void;
}

// Create the context with default values
const ExperimentContext = createContext<ExperimentContextType>({
  experimentData: {
    title: '',
    description: '',
    randomizationMethod: '',
    sampleSize: null,
    variables: [],
    treatmentGroups: []
  },
  updateExperimentData: () => {}
});

export default ExperimentContext;