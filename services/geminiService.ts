
import { GoogleGenAI, Type } from "@google/genai";
import { ParsedDish } from "../types";

// Always initialize GoogleGenAI with the API_KEY from process.env.API_KEY as per guidelines.
export const parseMenuText = async (text: string): Promise<ParsedDish[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Jesteś ekspertem od menu restauracyjnych. Przeanalizuj poniższy tekst i wyodrębnij z niego listę dań.
      Tekst menu:
      ${text}`,
      config: {
        responseMimeType: "application/json",
        // Using responseSchema is the recommended way to get structured JSON output.
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: {
                type: Type.STRING,
                description: 'Unique short ID for the dish.',
              },
              name: {
                type: Type.STRING,
                description: 'Full name of the dish.',
              },
              description: {
                type: Type.STRING,
                description: 'Short description of ingredients.',
              },
              price: {
                type: Type.STRING,
                description: 'Price of the dish with currency.',
              },
            },
            required: ["id", "name"],
            propertyOrdering: ["id", "name", "description", "price"],
          },
        },
      }
    });
    
    // Access response.text property directly.
    const jsonStr = response.text;
    if (!jsonStr) return [];
    
    return JSON.parse(jsonStr.trim());
  } catch (error: any) {
    console.error("Błąd parsowania menu:", error);
    if (error.message?.includes("API key not valid")) {
      throw new Error("Nieprawidłowy klucz API. Skontaktuj się z administratorem.");
    }
    throw error;
  }
};

export const generateFoodImage = async (
  base64Image: string | null,
  prompt: string,
  config: { 
    aspectRatio: string; 
    mode: string; 
    dishName?: string;
    dishPrice?: string;
    includeName?: boolean;
    includePrice?: boolean;
    textStyle?: string;
    refinementPrompt?: string;
    lightingStyle?: string;
    focusStyle?: string;
  }
): Promise<string | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const parts: any[] = [];
    
    let textConstraint = "";
    if (config.mode === 'MENU') {
      textConstraint = "ZASADA: Absolutny zakaz dodawania tekstów i znaków wodnych. Tylko czysta fotografia jedzenia.";
    } else {
      const texts = [];
      if (config.includeName && config.dishName) texts.push(config.dishName);
      if (config.includePrice && config.dishPrice) texts.push(config.dishPrice);
      textConstraint = texts.length > 0 
        ? `ZADANIE: Dodaj na obrazku stylowy napis: ${texts.join(" - ")}. Styl: ${config.textStyle}.` 
        : "";
    }

    const refinementMsg = config.refinementPrompt ? `\nKOREKTA: ${config.refinementPrompt}.` : "";

    if (base64Image) {
      parts.push({ 
        inlineData: { 
          data: base64Image.includes(',') ? base64Image.split(',')[1] : base64Image, 
          mimeType: 'image/png' 
        } 
      });
      parts.push({ 
        text: `ZMODYFIKUJ TO ZDJĘCIE: ${refinementMsg}\nStyl: ${prompt}. Oświetlenie: ${config.lightingStyle}. Ostrość: ${config.focusStyle}. ${textConstraint}\nFormat: ${config.aspectRatio}.` 
      });
    } else {
      parts.push({ 
        text: `FOTOGRAFIA PRODUKTOWA: ${config.dishName}. ${refinementMsg}\nScena: ${prompt}. ${textConstraint}\nOświetlenie: ${config.lightingStyle}. Ostrość: ${config.focusStyle}.\nProporcje: ${config.aspectRatio}.` 
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts },
      config: {
        imageConfig: { 
          aspectRatio: config.aspectRatio as any 
        }
      }
    });

    // Iterate through parts to find the image part as recommended by guidelines.
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("AI Image Generation Error:", error);
    return null;
  }
};
