import { useEffect, useRef, useState } from 'react'
import './App.css'

const WS_URL = 'ws://localhost:30001'

function App() {
  const [messages, setMessages] = useState<string[]>([])
  const [input, setInput] = useState('')
  const ws = useRef<WebSocket | null>(null)

  useEffect(() => {
    ws.current = new window.WebSocket(WS_URL)
    ws.current.onmessage = async (event) => {
      if (typeof event.data === 'string') {
        setMessages((prev) => [...prev, event.data])
      } else if (event.data instanceof Blob) {
        const text = await event.data.text()
        setMessages((prev) => [...prev, text])
      }
    }
    return () => {
      ws.current?.close()
    }
  }, [])

  const sendMessage = () => {
    if (input.trim() && ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(input)
      setInput('')
    }
  }

  return (
    <div className="chat-container">
      <h2>实时聊天室</h2>
      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className="chat-message">{msg}</div>
        ))}
      </div>
      <div className="chat-input">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="输入消息..."
        />
        <button onClick={sendMessage}>发送</button>
      </div>
    </div>
  )
}

export default App
