import { GoogleGenAI, Type } from "@google/genai";
import { ParsedDish } from "../types";

/**
 * Pobiera klucz API i inicjalizuje klienta.
 */
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("KRYSZTYCZNY BŁĄD: process.env.API_KEY jest pusty! Sprawdź czy redeploy na Vercel został wykonany.");
    throw new Error("Brak klucza API. Upewnij się, że dodałeś API_KEY w Vercel i wykonałeś Redeploy.");
  }
  return new GoogleGenAI({ apiKey });
};

export const parseMenuText = async (text: string): Promise<ParsedDish[]> => {
  try {
    const ai = getAiClient();
    console.log("Gemini: Rozpoczynam parsowanie menu...");
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Jesteś profesjonalnym analitykiem menu restauracyjnych. 
      Wyodrębnij wszystkie potrawy z poniższego tekstu i zwróć je jako tablicę JSON. 
      Pola: id (string), name (string), description (string), price (string).
      
      Tekst menu:
      ${text}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              price: { type: Type.STRING },
            },
            required: ["id", "name"],
          },
        },
      }
    });
    
    const jsonStr = response.text;
    if (!jsonStr) throw new Error("Otrzymano pustą odpowiedź z AI.");
    
    return JSON.parse(jsonStr.trim());
  } catch (error: any) {
    console.error("Szczegóły błędu API Gemini:", error);
    
    if (error.status === 403 || error.message?.includes("API key")) {
      throw new Error("Nieprawidłowy klucz API. Sprawdź czy klucz w Vercel jest poprawny i czy projekt ma włączone billingi/limity.");
    }
    
    throw new Error(`Błąd AI: ${error.message || "Błąd połączenia z serwerem"}`);
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
  try {
    const ai = getAiClient();
    const parts: any[] = [];
    
    let textConstraint = config.mode === 'MENU' 
      ? "No text, no labels, no watermarks. Pure food photography." 
      : `You can add text: ${config.dishName || ''}. Style: ${config.textStyle || 'premium'}.`;

    const refinementMsg = config.refinementPrompt ? `ADJUSTMENT: ${config.refinementPrompt}.` : "";

    if (base64Image) {
      parts.push({ 
        inlineData: { 
          data: base64Image.includes(',') ? base64Image.split(',')[1] : base64Image, 
          mimeType: 'image/png' 
        } 
      });
      parts.push({ 
        text: `Enhance this food photo. ${refinementMsg} Scene: ${prompt}. Lighting: ${config.lightingStyle}. ${textConstraint} Aspect: ${config.aspectRatio}.` 
      });
    } else {
      parts.push({ 
        text: `Create realistic food photography of: ${config.dishName}. ${refinementMsg} Style: ${prompt}. Lighting: ${config.lightingStyle}. ${textConstraint} Aspect: ${config.aspectRatio}.` 
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

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error: any) {
    console.error("Błąd generowania obrazu:", error);
    return null;
  }
};