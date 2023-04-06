import type { NextApiRequest, NextApiResponse } from 'next'
import { Configuration, ChatCompletionRequestMessage, OpenAIApi } from 'openai'

const configuration = new Configuration({
  organization: process.env.OPENAI_ORGANIZATION || '',
  apiKey: process.env.OPENAI_API_KEY || '',
})
const client = new OpenAIApi(configuration)
const OPEN_AI_MODEL = 'gpt-3.5-turbo'
const SYSTEM_PROMPT: ChatCompletionRequestMessage = { role: 'system' , content: 'You are friendly and provide short concise answers. You are casual and conversational.' }

const chatApi = async (messages: ChatCompletionRequestMessage[]) => {
  try {
    const preparedMessages = [SYSTEM_PROMPT, ...messages]
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
      const result = await chatApi(req.body.messages)
      if (!result) {
        throw new Error('No response from Chat API')
      }
      res.status(200).json(result)
    } catch (err) {
      console.warn(err)
      res.status(500).json('Internal Server Error.')
    }
  } else {
    res.status(405).json('Invalid Method')
  }
}
