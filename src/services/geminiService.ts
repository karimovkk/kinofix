import { GoogleGenAI, Type } from "@google/genai";

export async function identifyMovieFromImage(base64Image: string, mimeType: string) {
  const models = [
    "gemini-flash-latest", 
    "gemini-3-flash-preview", 
    "gemini-3.1-flash-lite-preview"
  ];
  let lastError: any = null;

  for (const modelName of models) {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("API kaliti topilmadi. Iltimos, sozlamalarda GEMINI_API_KEY ni o'rnating.");
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = "Ushbu kadrdagi kinoni aniqlang. Kino nomi, chiqarilgan yili va qisqacha 1 gapdan iborat xulosani bering. Javobni JSON formatida qaytaring.";

      const response = await ai.models.generateContent({
        model: modelName,
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
    } catch (error: any) {
      lastError = error;
      console.warn(`Model ${modelName} failed, trying next...`, error);
      // If it's not a quota error, we might want to stop, but for now let's try next anyway
      continue;
    }
  }

  // If we reach here, all models failed
  console.error("All models failed identifying movie:", lastError);
  if (lastError?.message?.includes("API_KEY_INVALID")) {
    throw new Error("API kaliti noto'g'ri. Iltimos, to'g'ri kalitni kiriting.");
  }
  throw new Error("AI limitiga yetdi yoki xatolik yuz berdi. Iltimos, birozdan so'ng urinib ko'ring.");
}
