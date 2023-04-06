import { useState } from 'react'
import axios from 'axios'
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

const getReply = async (messages: ChatCompletionRequestMessage[]): Promise<string> => {
  const result = await axios.post('/api/chat', { messages })
  const reply = result.data
  if (!reply) {
    throw new Error('No response from AI')
  }
  return reply
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
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [chatboxText, setChatboxText] = useState<string>('')
  const [alerts, setAlerts] = useState<Alerts[]>([])
  // const [chatVoice, setChatVoice] = useState<Sound | undefined>(undefined)

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

  const onSend = async (message: Message) => {
    if (!loading){
      let text = ''

      const newMessages = [message, ...messages]

      setMessages(newMessages)
      setLoading(true)
  
      try {
        text = await getReply(convertChatHistory(newMessages))

        const replyMessage: Message = {
          role: 'assistant',
          content: text,
          datetime: new Date()
        }

        setMessages([replyMessage, ...newMessages])
      } catch (err) {
        createAlert('Something went wrong with the reply.', 'error')
        console.warn(err)
      } finally {
        setLoading(false)
      }

      // if (text) {
      //   try {
      //     const audio = await elevenLabsApiTestWrapper(text)
      //     const path = binaryToBlob('audio/mpeg', audio)
      //     console.log('path:', path)
          
      //     const sound = new Sound(path, '', (error) => {
      //       if (error) {
      //         console.warn('Unable to read chat voice audio', error);
      //         return;
      //       }
      //     });
      //     setChatVoice(sound)
      //     sound.play(success => {
      //       if (!success) {
      //         console.warn('Chat Voice Audio playback failed');
      //       }
      //     });
      //   } catch (err) {
      //     console.warn(err)
      //   }
      // }
    }
  }

  return (
    <Paper sx={{ width: '100%', padding: '8px', display: 'flex', flexDirection: 'column-reverse', justifyContent: 'space-between', overflow: 'auto' }}>
      <div style={{ display: 'flex', flexDirection: 'column-reverse' }}>
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <TextField 
            disabled={loading}
            label="Type and [ENTER]!" 
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
          <Button disabled={loading} size='large' color='primary' variant="outlined" sx={{ margin: '0 8px 0 8px' }}>
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