
import { GoogleGenAI, Type } from "@google/genai";
import { ParsedDish } from "../types";

export const parseMenuText = async (text: string): Promise<ParsedDish[]> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    console.error("BŁĄD KRYTYCZNY: Brak klucza API_KEY w process.env.");
    throw new Error("Brak klucza API. Upewnij się, że klucz API_KEY jest poprawnie skonfigurowany w Vercel/środowisku.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  console.log("Gemini: Rozpoczynam analizę menu (model: gemini-3-flash-preview)...");
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', // Wybieramy szybszy model do zadań tekstowych
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
      console.warn("Gemini: Model zwrócił pustą treść.");
      return [];
    }
    
    const parsed = JSON.parse(jsonStr.trim());
    console.log(`Gemini: Wyodrębniono ${parsed.length} pozycji menu.`);
    return parsed;
  } catch (error: any) {
    console.error("Szczegóły błędu Gemini:", error);
    
    // Obsługa błędów autoryzacji
    if (error.message?.includes("API key not valid") || error.status === 403 || error.status === 401) {
      throw new Error("Klucz API jest nieprawidłowy lub nieaktywny. Sprawdź konfigurację API_KEY.");
    }
    
    // Obsługa limitów (quota)
    if (error.message?.includes("quota") || error.status === 429) {
      throw new Error("Przekroczono limit zapytań API (Quota). Spróbuj ponownie za chwilę.");
    }

    throw new Error(`Błąd komunikacji z AI: ${error.message || "Nieznany problem"}`);
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
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("Image Gen: Brak klucza API.");
    return null;
  }

  const ai = new GoogleGenAI({ apiKey });
  
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
    console.error("Błąd generowania obrazu AI:", error);
    return null;
  }
};
