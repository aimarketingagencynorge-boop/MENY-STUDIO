import { GoogleGenAI, Type } from "@google/genai";
import { ParsedDish } from "../types";

/**
 * Inicjalizacja klienta Google GenAI.
 * Klucz API musi znajdować się w zmiennej środowiskowej API_KEY.
 */
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("DEBUG: Klucz process.env.API_KEY nie został wykryty w środowisku przeglądarki.");
  }
  return new GoogleGenAI({ apiKey: apiKey || "" });
};

export const parseMenuText = async (text: string): Promise<ParsedDish[]> => {
  const ai = getAiClient();
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Jesteś profesjonalnym analitykiem menu restauracyjnych. 
      Wyodrębnij wszystkie potrawy z poniższego tekstu. 
      Zwróć wynik jako tablicę JSON z polami: id, name, description, price.
      
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
    if (!jsonStr) return [];
    
    return JSON.parse(jsonStr.trim());
  } catch (error: any) {
    console.error("Błąd parseMenuText:", error);
    if (error.status === 403 || error.message?.includes("API key")) {
      throw new Error("Klucz API jest nieprawidłowy lub nie został jeszcze załadowany (spróbuj redeploy na Vercel).");
    }
    throw new Error("Wystąpił problem podczas analizy menu. Sprawdź połączenie.");
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
  const ai = getAiClient();
  
  try {
    const parts: any[] = [];
    
    let textConstraint = config.mode === 'MENU' 
      ? "Absolutny zakaz napisów i logo. Czyste zdjęcie produktu." 
      : `Możesz dodać tekst: ${config.dishName || ''}. Styl: ${config.textStyle || 'premium'}.`;

    const refinementMsg = config.refinementPrompt ? `KOREKTA: ${config.refinementPrompt}.` : "";

    if (base64Image) {
      parts.push({ 
        inlineData: { 
          data: base64Image.includes(',') ? base64Image.split(',')[1] : base64Image, 
          mimeType: 'image/png' 
        } 
      });
      parts.push({ 
        text: `Przetwórz to zdjęcie dania. ${refinementMsg} Zastosuj tło: ${prompt}. Oświetlenie: ${config.lightingStyle}. ${textConstraint} Proporcje: ${config.aspectRatio}.` 
      });
    } else {
      parts.push({ 
        text: `Wygeneruj realistyczne zdjęcie dania: ${config.dishName}. ${refinementMsg} Styl tła: ${prompt}. Oświetlenie: ${config.lightingStyle}. ${textConstraint} Proporcje: ${config.aspectRatio}.` 
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
    console.error("Błąd generateFoodImage:", error);
    return null;
  }
};