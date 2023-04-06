export type Message = {
  role: 'user' | 'assistant'
  content: string
  datetime: Date
}

export type Alerts = {
  severity: 'info' | 'success' | 'warning' | 'error'
  content: string
}