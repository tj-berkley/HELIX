
import { GoogleGenAI, Type } from "@google/genai";

// Always initialize with process.env.API_KEY directly as per SDK requirements
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface BoardGenerationOptions {
  deadline?: string;
  teamSize?: string;
  complexity?: 'Simple' | 'Medium' | 'Complex';
  industry?: string;
  methodology?: 'Agile' | 'Waterfall' | 'Kanban';
  primaryGoal?: 'Speed' | 'Quality' | 'Cost-Efficiency';
}

export const generateBoardFromPrompt = async (prompt: string, options: BoardGenerationOptions = {}) => {
  const { deadline, teamSize, complexity = 'Medium', industry, methodology = 'Agile', primaryGoal } = options;
  
  const contextStrings = [];
  if (deadline) contextStrings.push(`The project must be completed by ${deadline}. Distribute task due dates logically leading up to this date.`);
  if (teamSize) contextStrings.push(`The team size is approximately ${teamSize}. Consider this for task volume and role assignment.`);
  if (complexity) contextStrings.push(`Project complexity level is: ${complexity}.`);
  if (industry) contextStrings.push(`The industry/domain for this project is: ${industry}.`);
  if (methodology) contextStrings.push(`Use a ${methodology} methodology for board structure (e.g., Sprints for Agile, Phases for Waterfall).`);
  if (primaryGoal) contextStrings.push(`The primary project goal is ${primaryGoal}. Prioritize task descriptions and priorities accordingly.`);
  
  const context = contextStrings.join(" ");

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Act as a world-class project manager. Based on the following requirement, generate a highly detailed and structured project board in JSON format. 
    Requirement: "${prompt}"
    Context: ${context}
    
    The response must strictly follow this structure:
    {
      "name": "Professional Board Name",
      "description": "Comprehensive project overview factoring in ${methodology} methodology",
      "groups": [
        {
          "name": "Phase/Sprint Name",
          "color": "A vibrant HEX color string",
          "items": [
            {
              "name": "Actionable task name",
              "status": "Not Started",
              "priority": "Low | Medium | High | Critical",
              "description": "Detailed explanation of requirements",
              "dueDate": "YYYY-MM-DD"
            }
          ]
        }
      ]
    }`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          groups: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                color: { type: Type.STRING },
                items: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      status: { type: Type.STRING },
                      priority: { type: Type.STRING },
                      description: { type: Type.STRING },
                      dueDate: { type: Type.STRING }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Failed to parse AI response", e);
    return null;
  }
};

export const refineUpdate = async (draft: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Rephrase this project update to be more professional and clear, keep it concise: "${draft}"`
  });
  return response.text;
};

export const suggestNextSteps = async (taskName: string, status: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `A user is stuck on a task: "${taskName}" currently in status "${status}". Give 3 concise, actionable bullet points to move forward.`
  });
  return response.text;
};
