import { GoogleGenAI, Type } from "@google/genai";
import { ParsedDish } from "../types";

/**
 * Zwraca klucz API ze zmiennych środowiskowych.
 * Zakładamy, że process.env.API_KEY jest dostępny w oknie przeglądarki.
 */
const getApiKey = () => {
  const apiKey = process.env.API_KEY?.trim();
  if (!apiKey || apiKey === "undefined") {
    console.error("BŁĄD KRYTYCZNY: Klucz API_KEY nie jest dostępny w process.env. Sprawdź Vercel Environment Variables.");
    return null;
  }
  return apiKey;
};

export const parseMenuText = async (text: string): Promise<ParsedDish[]> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("Klucz API nie został skonfigurowany. Dodaj API_KEY w Vercel i wykonaj REDEPLOY.");
  }

  // Tworzymy nową instancję bezpośrednio przed wywołaniem
  const ai = new GoogleGenAI({ apiKey });
  
  try {
    console.log("Gemini: Rozpoczynam analizę menu (Model: gemini-3-flash-preview)...");
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Jesteś profesjonalnym analitykiem menu restauracyjnych. 
      Wyodrębnij potrawy z poniższego tekstu. 
      Zwróć wynik jako czysty JSON (tablica obiektów). 
      Pola: id (string), name (string), description (string), price (string).
      
      TEKST MENU DO ANALIZY:
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
    
    const resultText = response.text;
    if (!resultText) throw new Error("Pusta odpowiedź z serwera AI.");
    
    return JSON.parse(resultText.trim());
  } catch (error: any) {
    console.error("SZCZEGÓŁY BŁĘDU GEMINI:", error);
    
    // Obsługa błędu 403/401
    if (error.status === 403 || error.status === 401 || error.message?.includes("API key")) {
      throw new Error(`Błąd klucza (403): Klucz jest nieprawidłowy, nieaktywny lub model gemini-3-flash-preview nie jest dostępny dla Twojego konta. Sprawdź ustawienia w Google AI Studio.`);
    }
    
    throw new Error(`Błąd analizy menu: ${error.message || "Błąd połączenia"}`);
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
  const apiKey = getApiKey();
  if (!apiKey) return null;

  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const parts: any[] = [];
    
    // Budowanie promptu wizualnego
    let visualPrompt = base64Image 
      ? `Studio professional transformation of this food photo. ` 
      : `High-end professional food photography of: ${config.dishName || 'Dish'}. `;
    
    visualPrompt += `Setting: ${prompt}. Lighting: ${config.lightingStyle}. Depth of field: ${config.focusStyle}. `;
    
    if (config.mode === 'MENU') {
      visualPrompt += "Clean presentation, absolute NO TEXT, NO LOGOS, NO WATERMARKS.";
    } else {
      visualPrompt += `Commercial style. ${config.dishName ? `Product name visible: ${config.dishName}.` : ''} Style: ${config.textStyle}.`;
    }

    if (config.refinementPrompt) {
      visualPrompt += ` REFINEMENT: ${config.refinementPrompt}.`;
    }

    if (base64Image) {
      parts.push({ 
        inlineData: { 
          data: base64Image.includes(',') ? base64Image.split(',')[1] : base64Image, 
          mimeType: 'image/png' 
        } 
      });
    }
    
    parts.push({ text: visualPrompt });

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