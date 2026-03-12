import { GoogleGenAI, Type } from "@google/genai";

export async function identifyMovieFromImage(base64Image: string, mimeType: string) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("API kaliti topilmadi. Iltimos, sozlamalarda GEMINI_API_KEY ni o'rnating.");
    }

    const ai = new GoogleGenAI({ apiKey });
    const model = "gemini-flash-latest";
    const prompt = "Ushbu kadrdagi kinoni aniqlang. Kino nomi, chiqarilgan yili va qisqacha 1 gapdan iborat xulosani bering. Javobni JSON formatida qaytaring.";

    const response = await ai.models.generateContent({
      model: model,
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Image.split(",")[1],
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            year: { type: Type.STRING },
            summary: { type: Type.STRING },
          },
          required: ["title", "year", "summary"],
        },
      }
    });

    const text = response.text;
    if (text) {
      return JSON.parse(text);
    }
    throw new Error("AI javob qaytarmadi");
  } catch (error: any) {
    console.error("Error identifying movie:", error);
    if (error.message?.includes("API_KEY_INVALID")) {
      throw new Error("API kaliti noto'g'ri. Iltimos, to'g'ri kalitni kiriting.");
    }
    throw error;
  }
}
