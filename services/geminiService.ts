
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { ParsedDish } from "../types";

// Inicjalizacja klienta zgodnie z wytycznymi - użycie bezpośrednio process.env.API_KEY
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const parseMenuText = async (text: string): Promise<ParsedDish[]> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Przeanalizuj poniższy tekst menu restauracji i wyodrębnij z niego listę dań. 
      Dla każdego dania stwórz obiekt z polami: id (unikalny ciąg znaków), name (pełna nazwa dania), description (krótki opis, jeśli dostępny), price (cena jako tekst, np. "39 zł").
      ZWRÓĆ WYŁĄCZNIE CZYSTY JSON BEZ ŻADNYCH DODATKOWYCH WYJAŚNIEŃ CZY BLOKÓW MARKDOWN.
      
      Tekst menu:
      ${text}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING, description: "Unikalny identyfikator" },
              name: { type: Type.STRING, description: "Nazwa dania" },
              description: { type: Type.STRING, description: "Opis składników lub dania" },
              price: { type: Type.STRING, description: "Cena potrawy" },
            },
            required: ["id", "name"]
          }
        }
      }
    });
    
    // Użycie .text bezpośrednio z odpowiedzi
    const jsonStr = response.text || '[]';
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Błąd krytyczny podczas parsowania menu:", error);
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
  const ai = getAI();
  
  try {
    const parts: any[] = [];
    
    let textConstraint = "";
    if (config.mode === 'MENU') {
      textConstraint = "ZASADA: Absolutny zakaz dodawania tekstów, znaków wodnych i napisów na obrazie. Tylko czysta fotografia jedzenia.";
    } else {
      const texts = [];
      if (config.includeName && config.dishName) texts.push(`nazwa: ${config.dishName}`);
      if (config.includePrice && config.dishPrice) texts.push(`cena: ${config.dishPrice}`);
      textConstraint = texts.length > 0 
        ? `ZADANIE: Dodaj na obrazku czytelny i stylowy napis: ${texts.join(", ")}. Styl napisu: ${config.textStyle}.` 
        : "Nie dodawaj tekstów.";
    }

    const refinementMsg = config.refinementPrompt 
      ? `\nKOREKTA: ${config.refinementPrompt}.` 
      : "";

    if (base64Image) {
      parts.push({ 
        inlineData: { 
          data: base64Image.includes(',') ? base64Image.split(',')[1] : base64Image, 
          mimeType: 'image/png' 
        } 
      });
      parts.push({ 
        text: `ZMODYFIKUJ ZDJĘCIE: ${refinementMsg}\nNowa scena: ${prompt}. Oświetlenie: ${config.lightingStyle}. Ostrość: ${config.focusStyle}. ${textConstraint}\nFormat: ${config.aspectRatio}.` 
      });
    } else {
      parts.push({ 
        text: `FOTOGRAFIA PRODUKTOWA: ${config.dishName}. ${refinementMsg}\nScena: ${prompt}. ${textConstraint}\nOświetlenie: ${config.lightingStyle}. Ostrość: ${config.focusStyle}.\nProporcje: ${config.aspectRatio}.` 
      });
    }

    const response: GenerateContentResponse = await ai.models.generateContent({
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
  } catch (error) {
    console.error("AI Generation Error:", error);
    return null;
  }
};
