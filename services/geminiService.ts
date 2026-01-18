
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { ParsedDish } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

/**
 * Parsuje surowy tekst menu na listę obiektów potraw.
 */
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

/**
 * Generuje zdjęcie dania z opcjonalnym tekstem i poprawkami.
 */
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
  }
): Promise<string | null> => {
  const ai = getAI();
  
  try {
    const parts: any[] = [];
    
    let textConstraint = "";
    if (config.mode === 'MENU') {
      textConstraint = "ABSOLUTNY ZAKAZ dodawania jakichkolwiek napisów, tekstów, logo czy znaków wodnych na obrazie. Obraz musi zawierać wyłącznie produkt spożywczy i tło.";
    } else if (config.mode === 'SOCIAL') {
      const textToRender = [];
      if (config.includeName && config.dishName) textToRender.push(`nazwę: "${config.dishName}"`);
      if (config.includePrice && config.dishPrice) textToRender.push(`cenę: "${config.dishPrice}"`);
      
      if (textToRender.length > 0) {
        textConstraint = `Nałóż na obraz estetyczny napis zawierający ${textToRender.join(" oraz ")}. Styl napisu: ${config.textStyle || 'nowoczesny, elegancki'}. Napis powinien być stylowo zintegrowany z grafiką social media.`;
      } else {
        textConstraint = "Nie dodawaj żadnych napisów ani tekstów na obrazie.";
      }
    }

    const refinementPart = config.refinementPrompt ? ` DODATKOWE INSTRUKCJE: ${config.refinementPrompt}.` : "";

    if (base64Image) {
      parts.push({ 
        inlineData: { 
          data: base64Image.includes(',') ? base64Image.split(',')[1] : base64Image, 
          mimeType: 'image/jpeg' 
        } 
      });
      parts.push({ 
        text: `Użyj tego zdjęcia jako bazy. Zmień tło na styl: ${prompt}. ${textConstraint}${refinementPart} Zachowaj realizm potrawy i profesjonalne oświetlenie. Proporcje: ${config.aspectRatio}.` 
      });
    } else {
      parts.push({ 
        text: `Stwórz profesjonalne zdjęcie reklamowe produktu: "${config.dishName}". Stylistyka: ${prompt}. ${textConstraint}${refinementPart} Produkt w centrum, oświetlenie studyjne. Proporcje: ${config.aspectRatio}.` 
      });
    }

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts },
      config: {
        imageConfig: {
          aspectRatio: config.aspectRatio as any || "1:1"
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
    
    throw new Error("Brak obrazu w odpowiedzi");
  } catch (error) {
    console.error("Błąd generowania AI:", error);
    return null;
  }
};
