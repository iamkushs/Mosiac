import { GoogleGenAI } from '@google/genai'

const genai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY })

export async function getEmbedding(query: string): Promise<number[]> {
  const result = await genai.models.embedContent({
    model: 'models/gemini-embedding-001',
    contents: query,
    config: {
      outputDimensionality: 768,
    },
  })

  return result.embeddings![0].values!
}
