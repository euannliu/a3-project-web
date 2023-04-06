import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

const ELEVENLABS_VOICE_ID = 'EXAVITQu4vr4xnSDxMaL'
const voiceApi = async (text: string) => {
  try {
    const body = {
      text,
      voice_settings: {
        stability: 0.75,
        similarity_boost: 0.75
      }
    }
    const headers =  { 
      'content-type': 'application/json',
      'xi-api-key': process.env.ELEVENLABS_API_KEY || ''
    }
    const result = await axios.post<Buffer>(`https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`, body, { headers })
    return result.data
  } catch (err) {
    console.warn(err)
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Buffer | string>
) {
  if (req.method === 'POST') {
    try {
      const result = await voiceApi(req.body.text)
      if (!result) {
        throw new Error('No response from Voice API')
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
