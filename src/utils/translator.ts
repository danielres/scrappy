import OpenAI from 'openai'
import config from '../../main/config.ts'

export async function openAi(str: string, language: string): Promise<string> {
  const openai = new OpenAI({
    apiKey: config.OPENAI_API_KEY,
  })

  const response = await openai.responses.create({
    model: config.OPENAI_MODEL,
    instructions: `Translate the following text to ${language}`,
    input: str,
    text: { format: { type: 'text' } },
    reasoning: {},
    tools: [],
    temperature: 1,
    max_output_tokens: 2048,
    top_p: 0.3,
    store: false,
  })

  return response.output_text
}

export default {
  openAi,
}
