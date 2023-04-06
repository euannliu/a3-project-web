import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import axios from 'axios';
import FormData from 'form-data';

import formidable, { Fields, File as FormidableFile, Files } from 'formidable'

export const config = {
  api: {
    bodyParser: false
  }
}

const transcriptionApi = async (file: FormidableFile) => {
  try {
    const f = fs.createReadStream(file.filepath)
    const form = new FormData()
    form.append('file', f, {
      filename: 'audio.mp3'
    })
    form.append('model', 'whisper-1')
    const headers =  { 
      'content-type': 'multipart/form-data',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      ...form.getHeaders()
    }
    const result = await axios.post(`https://api.openai.com/v1/audio/transcriptions`, form, { 
      headers,
      transformRequest: (data, _headers) => {
        return data;
      },
    })
    return result.data.text
  } catch (err) {
    console.warn(err)
  }
}

type Form = {
  err: any
  fields: Fields
  files: Files
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<string>
) {
  if (req.method === 'POST') {
    try {
      const data = await new Promise<Form>((resolve) => {
        const form = formidable()
        form.parse(req, async (err, fields, files) => {
          resolve({ err, fields, files })
        })
      })
      if (data.err) {
        throw new Error(data.err)
      }
      const result = await transcriptionApi(data.files['file'] as FormidableFile)
      if (!result) {
        throw new Error('No response from Transcription API')
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
