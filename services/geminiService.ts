
import { GoogleGenAI, Type } from "@google/genai";
import { NutritionData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const fetchNutritionInfo = async (foodQuery: string): Promise<NutritionData> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze the nutritional content of "${foodQuery}". If it's a dish, provide an average estimate for a standard serving size.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          foodName: { type: Type.STRING, description: "The standardized name of the food." },
          servingSize: { type: Type.STRING, description: "The serving size used for calculations (e.g., '100g', '1 cup')." },
          calories: { type: Type.NUMBER, description: "Total calories per serving." },
          protein: { type: Type.NUMBER, description: "Protein in grams." },
          carbs: { type: Type.NUMBER, description: "Total carbohydrates in grams." },
          fat: { type: Type.NUMBER, description: "Total fat in grams." },
          fiber: { type: Type.NUMBER, description: "Dietary fiber in grams." },
          sugar: { type: Type.NUMBER, description: "Sugars in grams." },
          sodium: { type: Type.NUMBER, description: "Sodium in milligrams." },
          description: { type: Type.STRING, description: "A brief professional culinary or health description." }
        },
        required: ["foodName", "servingSize", "calories", "protein", "carbs", "fat", "fiber", "sugar", "sodium", "description"],
        propertyOrdering: ["foodName", "servingSize", "calories", "protein", "carbs", "fat", "fiber", "sugar", "sodium", "description"]
      },
    },
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI service");
  
  return JSON.parse(text) as NutritionData;
};
