
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { ParsedDish } from "../types";

const getAI = () => {
  const apiKey = (typeof process !== 'undefined' && process.env?.API_KEY) || "";
  return new GoogleGenAI({ apiKey });
};

export const parseMenuText = async (text: string): Promise<ParsedDish[]> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Wyodrębnij nazwy dań, ich opisy i ceny z poniższego tekstu menu. Zwróć dane w formacie czystego JSON.
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
            required: ["id", "name"]
          }
        }
      }
    });
    
    const jsonStr = response.text?.trim() || '[]';
    const cleanJson = jsonStr.replace(/^```json/, '').replace(/```$/, '').trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Błąd parsowania menu:", error);
    return [];
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
      textConstraint = "ZASADA: Absolutny zakaz dodawania tekstów, znaków wodnych i napisów na obrazie.";
    } else {
      const texts = [];
      if (config.includeName && config.dishName) texts.push(`nazwa: ${config.dishName}`);
      if (config.includePrice && config.dishPrice) texts.push(`cena: ${config.dishPrice}`);
      textConstraint = texts.length > 0 
        ? `ZADANIE: Dodaj na obrazku czytelny i stylowy napis: ${texts.join(", ")}. Styl napisu: ${config.textStyle}.` 
        : "Nie dodawaj tekstów.";
    }

    const refinementMsg = config.refinementPrompt 
      ? `\nZMODYFIKUJ OBRAZ WEDŁUG TYCH INSTRUKCJI: ${config.refinementPrompt}. Skup się na tych zmianach, zachowując esencję dania.` 
      : "";

    if (base64Image) {
      // PROCES EDYCJI (Image-to-Image)
      parts.push({ 
        inlineData: { 
          data: base64Image.includes(',') ? base64Image.split(',')[1] : base64Image, 
          mimeType: 'image/png' 
        } 
      });
      parts.push({ 
        text: `Traktuj to zdjęcie jako punkt wyjścia. ${refinementMsg}\nZmień otoczenie na styl: ${prompt}. Oświetlenie: ${config.lightingStyle}. Ostrość: ${config.focusStyle}. ${textConstraint}\nFormat: ${config.aspectRatio}. Zachowaj wysoką jakość i realizm jedzenia.` 
      });
    } else {
      // NOWA GENERACJA
      parts.push({ 
        text: `Stwórz profesjonalne zdjęcie reklamowe potrawy: ${config.dishName || 'Danie kuchni premium'}. ${refinementMsg}\nStylistyka tła: ${prompt}. ${textConstraint}\nOświetlenie: ${config.lightingStyle}. Ostrość: ${config.focusStyle}.\nProporcje: ${config.aspectRatio}. Fotografia produktowa najwyższej klasy.` 
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
