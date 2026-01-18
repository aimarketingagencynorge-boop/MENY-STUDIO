
import { GoogleGenAI, Type } from "@google/genai";
import { ParsedDish } from "../types";

export const parseMenuText = async (text: string): Promise<ParsedDish[]> => {
  // Always initialize right before use with process.env.API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  console.log("Gemini: Rozpoczynam analizę menu...");
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Używamy modelu Pro dla lepszego rozumienia tekstu menu
      contents: `Jesteś profesjonalnym analitykiem menu restauracyjnych. 
      Wyodrębnij wszystkie dania z poniższego tekstu. 
      Dla każdego dania stwórz obiekt z polami: 
      - id (krótki unikalny tekst)
      - name (pełna nazwa)
      - description (składniki lub opis)
      - price (cena z walutą)
      
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
            propertyOrdering: ["id", "name", "description", "price"]
          },
        },
      }
    });
    
    const jsonStr = response.text;
    if (!jsonStr) {
      console.warn("Gemini: Pusta odpowiedź z modelu.");
      return [];
    }
    
    const parsed = JSON.parse(jsonStr.trim());
    console.log(`Gemini: Wyodrębniono ${parsed.length} dań.`);
    return parsed;
  } catch (error: any) {
    console.error("Gemini Error (parseMenuText):", error);
    
    // Specyficzna obsługa błędów klucza API
    if (error.message?.includes("API key not valid") || error.message?.includes("403") || error.message?.includes("401")) {
      throw new Error("Klucz API jest nieprawidłowy lub wygasł. Sprawdź konfigurację environment variables.");
    }
    
    throw new Error("Wystąpił błąd podczas komunikacji z AI. Spróbuj ponownie za chwilę.");
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
    console.error("Gemini Error (generateFoodImage):", error);
    return null;
  }
};
