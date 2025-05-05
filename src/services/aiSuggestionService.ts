import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI with your API key
// You'll need to get an API key from https://makersuite.google.com/app/apikey
import 'dotenv/config'; // Auto-loads the .env file from the project root

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'YOUR_API_KEY_HERE');
console.log(process.env.NEXT_PUBLIC_GEMINI_API_KEY)


async function getGeminiResponse(prompt: string) {
  try {
    // For text-only input, use the gemini-pro model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return null;
  }
}

// Parse the AI response into suggestion and explanation
function parseAIResponse(response: string | null, defaultSuggestion: any): { suggestion: any; explanation: string } {
  if (!response) return defaultSuggestion;
  
  try {
    // Try to parse JSON if the AI returned it
    if (response.includes("{") && response.includes("}")) {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedResponse = JSON.parse(jsonMatch[0]);
        return {
          suggestion: parsedResponse.suggestion,
          explanation: parsedResponse.explanation
        };
      }
    }
    
    // Fallback extraction method
    const lines = response.split('\n').filter(line => line.trim());
    const suggestion = lines[0].replace('Suggestion:', '').trim();
    const explanation = lines.slice(1).join(' ').replace('Explanation:', '').trim();
    
    return {
      suggestion: suggestion,
      explanation: explanation || defaultSuggestion.explanation
    };
  } catch (e) {
    console.error("Error parsing AI response:", e);
    return defaultSuggestion;
  }
}

export const getSampleSizeSuggestion = async (experimentType: string, domain: string, expectedEffect: string) => {
  // Default fallback suggestion
  const defaultSuggestion = {
    suggestion: expectedEffect === 'small' ? 89898 : 69696,
    explanation: "This balanced sample size should provide sufficient statistical power while remaining feasible to implement."
  };
  
  const prompt = `
    I need a recommendation for sample size in an experiment with these parameters:
    - Experiment domain: ${domain}
    - Expected effect size: ${expectedEffect}
    - Experiment type: ${experimentType || 'general'}
    
    Please provide your recommendation in this format:
    {
      "suggestion": [numeric sample size],
      "explanation": "[explanation of why this sample size is appropriate]"
    }
  `;
  
  const response = await getGeminiResponse(prompt);
  return parseAIResponse(response, defaultSuggestion);
};

export const getRandomizationSuggestion = async (sampleSize: number, variables: string[] | null, clusters: string[] | null) => {
  // Default fallback suggestion
  const defaultSuggestion = {
    suggestion: 'simple',
    explanation: "Simple randomization is efficient and adequate for your experiment size and requirements."
  };
  
  const prompt = `
    I need a recommendation for the best randomization method in an experiment with these parameters:
    - Sample size: ${sampleSize}
    - Variables that might affect outcomes: ${variables ? variables.join(', ') : 'None'}
    - Natural clusters/groups: ${clusters ? clusters.join(', ') : 'None'}
    
    Choose from these randomization methods: simple, stratified, cluster.
    
    Please provide your recommendation in this format:
    {
      "suggestion": "[randomization method]",
      "explanation": "[explanation of why this method is appropriate]"
    }
  `;
  
  const response = await getGeminiResponse(prompt);
  return parseAIResponse(response, defaultSuggestion);
};

export const getVariableSuggestions = async (experimentType: string, domain: string) => {
  // Fallbacks
  const domainVariables = {
    'education': ['Test Scores', 'Attendance Rate', 'Completion Rate'],
    'healthcare': ['Treatment Adherence', 'Recovery Time', 'Symptom Severity'],
    'financial': ['Savings Rate', 'Loan Repayment', 'Financial Knowledge Score'],
    'default': ['Engagement', 'Satisfaction', 'Conversion Rate']
  };
  
  const defaultVariables = domainVariables[domain as keyof typeof domainVariables] || domainVariables.default;
  
  const prompt = `
    I'm designing an experiment in the ${domain} domain. 
    Experiment type: ${experimentType || 'general'}
    
    Please suggest 3-5 key variables that would be important to measure in this experiment.
    Return only the variable names as a JSON array of strings, like this: ["Variable 1", "Variable 2", "Variable 3"]
  `;
  
  try {
    const response = await getGeminiResponse(prompt);
    
    if (response) {
      // Try to extract a JSON array from the response
      const match = response.match(/\[[\s\S]*\]/);
      if (match) {
        const variables = JSON.parse(match[0]);
        if (Array.isArray(variables) && variables.length > 0) {
          return variables;
        }
      }
      
      // Fallback: Extract line by line
      const lines = response.split('\n');
      const extractedVariables = lines
        .map(line => line.replace(/^[0-9-.*]\s*/, '').trim())  // Remove list markers
        .filter(line => line.length > 0 && !line.startsWith('{') && !line.startsWith('}'));
        
      if (extractedVariables.length > 0) {
        return extractedVariables;
      }
    }
  } catch (e) {
    console.error("Error in getVariableSuggestions:", e);
  }
  
  return defaultVariables;
};

export const getExperimentTitleSuggestions = async (domain: string, focus: string) => {
  const defaultSuggestions = [
    `Impact of Intervention on ${focus} in ${domain}`,
    `Evaluating ${focus} Methods in ${domain} Settings`, 
    `${domain} ${focus} Improvement Study`
  ];
  
  const prompt = `
    I'm designing an experiment in the ${domain} domain focusing on ${focus}. 
    Please suggest 3 clear, professional titles for this experiment.
    Return only the titles as a JSON array of strings, like this: ["Title 1", "Title 2", "Title 3"]
  `;
  
  try {
    const response = await getGeminiResponse(prompt);
    
    if (response) {
      // Try to extract a JSON array from the response
      const match = response.match(/\[[\s\S]*\]/);
      if (match) {
        const titles = JSON.parse(match[0]);
        if (Array.isArray(titles) && titles.length > 0) {
          return titles;
        }
      }
      
      // Fallback: Extract line by line
      const lines = response.split('\n');
      const extractedTitles = lines
        .map(line => line.replace(/^[0-9-.*]\s*/, '').trim())  // Remove list markers
        .filter(line => line.length > 0 && !line.startsWith('{') && !line.startsWith('}'));
        
      if (extractedTitles.length > 0) {
        return extractedTitles;
      }
    }
  } catch (e) {
    console.error("Error in getExperimentTitleSuggestions:", e);
  }
  
  return defaultSuggestions;
};