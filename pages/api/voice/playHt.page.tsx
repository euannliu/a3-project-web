import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

import { sleep } from '../../../components/sleep'

const englishVoice = 'en-US-SaraNeural'

const voiceApi = async (text: string) => {
  try {
    const body = {
      content: [text],
      voice: englishVoice
    }
    const headers =  { 
      'content-type': 'application/json',
      'Authorization': process.env.PLAY_HT_API_KEY || '',
      'X-User-ID': process.env.PLAY_HT_USER_ID || ''
    }
    const resultConvert = await axios.post(`https://play.ht/api/v1/convert`, body, { headers })
    const transcriptionId = resultConvert.data?.transcriptionId
    if (!transcriptionId) {
      throw new Error('Unable to retrieve transcription ID.')
    }

    let audioUrl = ''
    const path = `https://play.ht/api/v1/articleStatus?transcriptionId=${transcriptionId}`
    let resultStatus = await axios.get(path, { headers })
    audioUrl = resultStatus.data.audioUrl
    while (!audioUrl) {
      await sleep(1000)
      resultStatus = await axios.get(path, { headers })
      audioUrl = resultStatus.data.audioUrl
    }

    return audioUrl
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
      if (!req.body.text) {
        res.status(400).json('Missing required parameters.')
      } else {
        const result = await voiceApi(req.body.text)
        if (!result) {
          throw new Error('No response from Voice API')
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
