import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import { Howl, Howler } from 'howler'
import { useAudioRecorder } from 'react-audio-voice-recorder';

import {
  Alert,
  Button,
  LinearProgress,
  Paper,
  Stack,
  TextField 
} from '@mui/material'

import MicIcon from '@mui/icons-material/Mic'

import { ChatCompletionRequestMessage } from 'openai'

import MessageBox from './messagebox'
import { Alerts, Message } from './types'

Howler.autoUnlock = true

const getTranscription = async (audio: Blob): Promise<string> => {
  const headers =  { 
    'content-type': 'multipart/form-data',
  }
  const form = new FormData()
  form.append('file', audio, 'audio.mp3')
  const result = await axios.post('/api/transcription', form, { headers })
  return result.data || ''
}

const getReply = async (messages: ChatCompletionRequestMessage[], character: string): Promise<string> => {
  const result = await axios.post('/api/chat', { messages, character })
  const reply = result.data
  if (!reply) {
    throw new Error('No response from AI')
  }
  return reply
}

const textToSpeech = async (text: string, character: string): Promise<Howl> => {
  const result = await axios.post('/api/voice/playHt', { text, character })
    const audio = result.data
  
    if (!audio) {
      throw new Error('Nothing returned from Voice API')
    }

    return new Howl({
      // src: [`data:audio/mp3;base64,${audio}`],  // For ElevenLabs
      src: audio,
      volume: 1,
      autoplay: true,
      loop: false,
      format: 'mp3',
    });

}

const convertChatHistory = (messages: Message[]): ChatCompletionRequestMessage[] => {
  return messages.map<ChatCompletionRequestMessage>(message => { 
    return {
      role: message.role, 
      content: message.content
    }
  }).reverse()
}

export default function Chat() {
  const router = useRouter()
  const { character } = router.query

  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [chatboxText, setChatboxText] = useState<string>('')
  const [alerts, setAlerts] = useState<Alerts[]>([])
  const [audioDom, setAudioDom] = useState<Howl | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)

  const {
    startRecording,
    stopRecording,
    recordingBlob,
    isRecording,
  } = useAudioRecorder();

  const createAlert = (content: string, severity: 'info' | 'success' | 'warning' | 'error') => {
    const newAlerts = [...alerts, { content, severity }]
    if (newAlerts.length > 3) {
      newAlerts.splice(0, 1)
    }
    setAlerts(newAlerts)
  }

  const deleteAlert = (index: number) => {
    const newAlerts = [...alerts]
    newAlerts.splice(index, 1)
    setAlerts(newAlerts)
  }

  useEffect(() => {
    if (recordingBlob) onSendRecording(recordingBlob)
  }, [recordingBlob])

  useEffect(() => {
    inputRef.current?.focus()
  }, [loading])

  const onSendRecording = async (audio: Blob) => {
    try {
      const content = await getTranscription(audio)
      const newMessage: Message = {
        role: 'user',
        content,
        datetime: new Date()
      }
      onSend(newMessage)
    } catch (err) {
      createAlert('Something went wrong with transcribing your voice.', 'error')
      console.warn(err)
    }
  }

  const onSend = async (message: Message) => {
    if (!loading && message && message.content){
      if (audioDom && audioDom.playing()) audioDom.stop()

      let text = ''
      const newMessages = [message, ...messages]
      setMessages(newMessages)
      setLoading(true)
  
      try {
        text = await getReply(convertChatHistory(newMessages), character as string)
        const replyMessage: Message = {
          role: 'assistant',
          content: text,
          datetime: new Date()
        }
        if (text) {
          try {
            const audio = await textToSpeech(text, character as string)
            audio.play()
            setAudioDom(audio)
          } catch (err) {
            createAlert('Something went wrong with the speech audio.', 'error')
            console.warn(err)
          }
        }
        setMessages([replyMessage, ...newMessages])
      } catch (err) {
        createAlert('Something went wrong with the reply.', 'error')
        console.warn(err)
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <Paper sx={{ width: '100%', padding: '8px', display: 'flex', flexDirection: 'column-reverse', justifyContent: 'space-between', overflow: 'auto' }}>
      <div style={{ display: 'flex', flexDirection: 'column-reverse' }}>
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <TextField 
            autoFocus
            disabled={isRecording || loading}
            inputRef={inputRef}
            label={ isRecording ? "Recording..." : "Type and [ENTER]!" }
            variant="filled" 
            fullWidth
            value={chatboxText}
            onChange={(event) => {
              setChatboxText(event.target.value)
            }}
            onKeyDown={(ev) => {
              if (ev.key === 'Enter') {  // TODO: Make mobile friendly
                setChatboxText('')
                const newMessage: Message = {
                  role: 'user',
                  content: chatboxText,
                  datetime: new Date()
                }
                onSend(newMessage)
              }
            }}
          />
          <Button 
            disabled={loading} 
            size='large' 
            color={isRecording ? 'secondary' : 'primary'}
            variant="outlined" 
            onClick={() => {
              if (isRecording) {
                stopRecording()
              } else {
                startRecording()
              }
            }}
            // onMouseDown={startRecording}
            // onMouseUp={stopRecording}
            sx={{ margin: '0 8px 0 8px' }}
          >
            <MicIcon fontSize='large'/>
          </Button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <br/>
          { loading ? <LinearProgress sx={{ width: '50%' }}/> : '' }
        </div>
        <Stack sx={{ width: '100%' }} spacing={2}>
          { alerts.map((alert, index) => (
              <Alert 
                key={index}
                severity={alert.severity}
                onClose={() => {
                  deleteAlert(index)
                }}
              >
                {alert.content}
              </Alert>
          ))}
        </Stack>
        { messages.map((message, index) => (
          <MessageBox key={index} {...message} />
        ))}
      </div>
    </Paper>
  )
}