import { GoogleGenAI, Type } from "@google/genai";
import { ParsedDish } from "../types";

/**
 * Helper to initialize the GenAI client.
 * Using process.env.API_KEY as per the required global configuration.
 */
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("Gemini Service: process.env.API_KEY is missing or undefined.");
  }
  return new GoogleGenAI({ apiKey: apiKey || "" });
};

export const parseMenuText = async (text: string): Promise<ParsedDish[]> => {
  const ai = getAiClient();
  
  console.log("Gemini: Rozpoczynam analizę menu...");
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Jesteś profesjonalnym analitykiem menu restauracyjnych. 
      Przeanalizuj poniższy tekst i wyodrębnij z niego listę wszystkich dań. 
      Dla każdego dania stwórz obiekt z polami: 
      - id (krótki unikalny identyfikator, np. dish-1)
      - name (pełna nazwa potrawy)
      - description (krótki opis, składniki)
      - price (cena z walutą, dokładnie jak w tekście)
      
      Zwróć wynik jako tablicę JSON.
      
      Tekst menu do analizy:
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
    if (!jsonStr) {
      console.error("Gemini: Pusta odpowiedź z modelu.");
      return [];
    }
    
    const parsed = JSON.parse(jsonStr.trim());
    console.log(`Gemini: Pomyślnie wyodrębniono ${parsed.length} dań.`);
    return parsed;
  } catch (error: any) {
    console.error("Gemini Error Details:", error);
    
    // Improved error messages for the UI
    if (error.status === 403 || error.message?.includes("API key not valid")) {
      throw new Error("Klucz API jest nieprawidłowy lub zablokowany. Sprawdź ustawienia API_KEY na Vercel.");
    }
    
    if (error.status === 429) {
      throw new Error("Przekroczono limit zapytań AI (Quota). Spróbuj ponownie za minutę.");
    }

    throw new Error(`Wystąpił problem z analizą AI: ${error.message || "Błąd połączenia"}.`);
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
    
    let textConstraint = "";
    if (config.mode === 'MENU') {
      textConstraint = "ZASADA: Absolutny zakaz dodawania jakichkolwiek napisów, tekstów, logo czy znaków wodnych. Obraz musi być czystym zdjęciem produktu.";
    } else {
      const texts = [];
      if (config.includeName && config.dishName) texts.push(config.dishName);
      if (config.includePrice && config.dishPrice) texts.push(config.dishPrice);
      textConstraint = texts.length > 0 
        ? `ZADANIE: Dodaj na obrazku estetyczny napis: ${texts.join(" - ")}. Styl graficzny napisu: ${config.textStyle}.` 
        : "Nie dodawaj żadnych tekstów.";
    }

    const refinementMsg = config.refinementPrompt ? `\nKOREKTA UŻYTKOWNIKA: ${config.refinementPrompt}.` : "";

    if (base64Image) {
      parts.push({ 
        inlineData: { 
          data: base64Image.includes(',') ? base64Image.split(',')[1] : base64Image, 
          mimeType: 'image/png' 
        } 
      });
      parts.push({ 
        text: `EDYCJA ZDJĘCIA: ${refinementMsg}\nZmień tło i styl zgodnie z: ${prompt}. Oświetlenie: ${config.lightingStyle}. Ostrość: ${config.focusStyle}. ${textConstraint}\nProporcje: ${config.aspectRatio}.` 
      });
    } else {
      parts.push({ 
        text: `GENEROWANIE ZDJĘCIA PRODUKTU: ${config.dishName}. ${refinementMsg}\nOpis sceny: ${prompt}. ${textConstraint}\nOświetlenie: ${config.lightingStyle}. Ostrość: ${config.focusStyle}.\nProporcje: ${config.aspectRatio}.` 
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
    console.error("Gemini Image Gen Error:", error);
    return null;
  }
};