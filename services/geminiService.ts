import { GoogleGenAI, Type } from "@google/genai";
import { ParsedDish } from "../types";

/**
 * Inicjalizuje klienta Google GenAI.
 * Klucz API jest pobierany bezpośrednio z process.env.API_KEY.
 */
const getAiClient = () => {
  const apiKey = process.env.API_KEY?.trim();
  if (!apiKey || apiKey === "undefined" || apiKey === "") {
    console.error("BŁĄD KONFIGURACJI: process.env.API_KEY nie został znaleziony.");
    throw new Error("Brak klucza API. Dodaj 'API_KEY' w Vercel Environment Variables i zrób REDEPLOY aplikacji.");
  }
  return new GoogleGenAI({ apiKey });
};

export const parseMenuText = async (text: string): Promise<ParsedDish[]> => {
  try {
    const ai = getAiClient();
    console.log("Gemini: Rozpoczynam analizę menu...");
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Jesteś profesjonalnym analitykiem menu restauracyjnych. 
      Przeanalizuj poniższy tekst i wyodrębnij z niego listę wszystkich dań. 
      Zwróć wynik jako tablicę obiektów JSON z polami: 
      - id (unikalny ciąg znaków)
      - name (nazwa dania)
      - description (krótki opis/składniki)
      - price (cena z tekstu)
      
      Tekst do analizy:
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
    
    if (!response.text) {
      throw new Error("Model nie zwrócił żadnego tekstu.");
    }

    const parsed = JSON.parse(response.text.trim());
    console.log(`Gemini: Wykryto ${parsed.length} dań.`);
    return parsed;
  } catch (error: any) {
    console.error("Szczegóły błędu parseMenuText:", error);
    
    // Obsługa błędów uprawnień/klucza
    if (error.message?.includes("API_KEY") || error.status === 403) {
      throw new Error("Problem z kluczem API. Upewnij się, że klucz jest poprawny i projekt w Google Cloud ma włączone Gemini API.");
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
  try {
    const ai = getAiClient();
    const parts: any[] = [];
    
    let textConstraint = config.mode === 'MENU' 
      ? "Clean food photography, NO TEXT, NO LABELS, NO WATERMARKS." 
      : `Professional ad photography. You can include stylish text: ${config.dishName || ''}.`;

    const refinementMsg = config.refinementPrompt ? `ADJUSTMENT: ${config.refinementPrompt}.` : "";

    if (base64Image) {
      parts.push({ 
        inlineData: { 
          data: base64Image.includes(',') ? base64Image.split(',')[1] : base64Image, 
          mimeType: 'image/png' 
        } 
      });
      parts.push({ 
        text: `Studio transformation of this food. ${refinementMsg} Style: ${prompt}. Lighting: ${config.lightingStyle}. ${textConstraint} Aspect: ${config.aspectRatio}.` 
      });
    } else {
      parts.push({ 
        text: `Realistic professional food photo: ${config.dishName}. ${refinementMsg} Scene: ${prompt}. Lighting: ${config.lightingStyle}. ${textConstraint} Aspect: ${config.aspectRatio}.` 
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