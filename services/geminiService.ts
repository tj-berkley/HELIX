
import { GoogleGenAI, Type } from "@google/genai";

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
  if (deadline) contextStrings.push(`The project must be completed by ${deadline}.`);
  if (teamSize) contextStrings.push(`The team size is approximately ${teamSize}.`);
  if (complexity) contextStrings.push(`Project complexity level is: ${complexity}.`);
  if (industry) contextStrings.push(`The industry/domain for this project is: ${industry}.`);
  if (methodology) contextStrings.push(`Use a ${methodology} methodology.`);
  if (primaryGoal) contextStrings.push(`The primary project goal is ${primaryGoal}.`);
  
  const context = contextStrings.join(" ");

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a structured project board JSON based on: "${prompt}". Context: ${context}`,
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

  return JSON.parse(response.text);
};

export const generateWorkflowFromPrompt = async (prompt: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Design a technical automation workflow logic based on this intent: "${prompt}". 
    The workflow should consist of a logical chain of nodes. 
    Ensure it includes appropriate triggers and actions.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          nodes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                type: { type: Type.STRING, enum: ['trigger', 'action', 'condition'] },
                icon: { type: Type.STRING },
                description: { type: Type.STRING },
                color: { type: Type.STRING }
              }
            }
          }
        }
      }
    }
  });
  return JSON.parse(response.text);
};

export const generateCampaignFromPrompt = async (prompt: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Create a marketing campaign strategy for: "${prompt}".`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            channel: { type: Type.STRING },
            startDate: { type: Type.STRING },
            summary: { type: Type.STRING }
          }
        }
      }
    }
  });
  return JSON.parse(response.text);
};

export const refineUpdate = async (draft: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Rephrase this project update to be more professional and clear, keep it concise: "${draft}"`
  });
  return response.text;
};
