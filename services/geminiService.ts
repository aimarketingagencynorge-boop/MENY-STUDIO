import { GoogleGenAI, Type } from "@google/genai";
import { ParsedDish } from "../types";

/**
 * Funkcja pomocnicza do pobierania klucza i logowania diagnostycznego.
 */
const getSafeApiKey = () => {
  const apiKey = process.env.API_KEY?.trim();
  if (!apiKey || apiKey === "undefined" || apiKey === "") {
    console.error("DEBUG: process.env.API_KEY jest PUSTY. Sprawdź ustawienia Vercel i zrób REDEPLOY.");
    return null;
  }
  // Logujemy tylko fragment klucza dla bezpieczeństwa, aby potwierdzić jego obecność
  console.log(`DEBUG: Klucz wykryty w systemie: ${apiKey.substring(0, 7)}...${apiKey.substring(apiKey.length - 4)}`);
  return apiKey;
};

export const parseMenuText = async (text: string): Promise<ParsedDish[]> => {
  const apiKey = getSafeApiKey();
  if (!apiKey) {
    throw new Error("Aplikacja nie widzi klucza API. Dodaj 'API_KEY' w Vercel Environment Variables i koniecznie zrób REDEPLOY.");
  }

  // Tworzymy instancję bezpośrednio przed wywołaniem
  const ai = new GoogleGenAI({ apiKey });
  
  try {
    console.log("Gemini: Rozpoczynam analizę menu (model: gemini-3-flash-preview)...");
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Jesteś ekspertem gastronomii i analitykiem danych. 
      Przekształć poniższy tekst menu na format JSON (tablica obiektów). 
      Zwróć TYLKO czysty kod JSON.
      
      Struktura obiektu:
      - id (string, unikalny)
      - name (string, nazwa dania)
      - description (string, opis)
      - price (string, cena)
      
      TEKST MENU:
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
    
    if (!response.text) throw new Error("API zwróciło pustą odpowiedź.");
    return JSON.parse(response.text.trim());
    
  } catch (error: any) {
    console.error("BŁĄD KRYTYCZNY GEMINI API:", error);
    
    if (error.status === 403) {
      throw new Error("Błąd 403 (Forbidden): Odmowa dostępu. Sprawdź: 1. Czy zaakceptowałeś nowe warunki (ToS) w Google AI Studio, 2. Czy API 'Generative Language' jest włączone dla tego klucza.");
    }
    
    throw new Error(`Błąd AI: ${error.message || "Błąd komunikacji"}`);
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
  const apiKey = getSafeApiKey();
  if (!apiKey) return null;

  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const parts: any[] = [];
    
    let visualPrompt = base64Image 
      ? `High-end professional studio transformation of this dish. ` 
      : `Ultra-realistic professional food photography of: ${config.dishName || 'Dish'}. `;
    
    visualPrompt += `Setting: ${prompt}. Lighting: ${config.lightingStyle}. ${config.focusStyle}. `;
    
    if (config.mode === 'MENU') {
      visualPrompt += "Style: Clean e-commerce photo, NO TEXT, NO LOGOS, NO WATERMARKS.";
    } else {
      visualPrompt += `Advertising poster style. ${config.dishName ? `Include text: ${config.dishName}.` : ''}`;
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