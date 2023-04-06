import type { NextApiRequest, NextApiResponse } from 'next'
import { Configuration, ChatCompletionRequestMessage, OpenAIApi } from 'openai'
import characters from './characterPrompts'

const configuration = new Configuration({
  organization: process.env.OPENAI_ORGANIZATION || '',
  apiKey: process.env.OPENAI_API_KEY || '',
})
const client = new OpenAIApi(configuration)

const OPEN_AI_MODEL = 'gpt-3.5-turbo'

const chatApi = async (messages: ChatCompletionRequestMessage[], character: string) => {
  try {
    const prompt: ChatCompletionRequestMessage = { role: 'system' , content: characters[character].prompt }
    const preparedMessages = [prompt, ...messages]
    const result = await client.createChatCompletion({ model: OPEN_AI_MODEL, messages: preparedMessages })
    return result.data.choices[0]?.message?.content
  } catch (err) {
    console.warn(err)
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<string>
) {
  if (req.method === 'POST') {
    try {
      if (!req.body.messages || !req.body.character) {
        res.status(400).json('Missing required parameters.')
      } else {
        const result = await chatApi(req.body.messages, req.body.character)
        if (!result) {
          throw new Error('No response from Chat API')
        }
        res.status(200).json(result)
      }
    } catch (err) {
      console.warn(err)
      res.status(500).json('Internal Server Error.')
    }
  } else {
    res.status(405).json('Invalid Method')
  }
}
