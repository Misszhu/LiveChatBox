import { useEffect, useRef, useState } from 'react'
import './App.css'

const WS_URL = 'ws://localhost:30001'

function App() {
  const [messages, setMessages] = useState<string[]>([])
  const [input, setInput] = useState('')
  const [wsStatus, setWsStatus] = useState<'connecting' | 'open' | 'closed'>('connecting')
  const ws = useRef<WebSocket | null>(null)

  useEffect(() => {
    ws.current = new window.WebSocket(WS_URL)
    ws.current.onopen = () => setWsStatus('open')
    ws.current.onclose = () => setWsStatus('closed')
    ws.current.onerror = () => setWsStatus('closed')
    ws.current.onmessage = async (event) => {
      if (typeof event.data === 'string') {
        console.log("event.data", event.data);
        setMessages((prev) => [...prev, event.data])
      } else if (event.data instanceof Blob) {
        const text = await event.data.text()
        console.log("text", text);
        setMessages((prev) => [...prev, text])
      }
    }
    return () => {
      ws.current?.close()
    }
  }, [])

  const sendMessage = () => {
    console.log("input", input);
    if (input.trim() && ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(input)
      setInput('')
    }
  }

  return (
    <div className="chat-container">
      <div style={{ marginBottom: 8 }}>
        <span style={{
          color: wsStatus === 'open' ? 'green' : wsStatus === 'connecting' ? 'orange' : 'red',
          fontWeight: 'bold',
        }}>
          {wsStatus === 'open' && '🟢 已连接'}
          {wsStatus === 'connecting' && '🟠 连接中...'}
          {wsStatus === 'closed' && '🔴 已断开'}
        </span>
      </div>
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
          disabled={wsStatus !== 'open'}
        />
        <button onClick={sendMessage} disabled={wsStatus !== 'open'}>发送</button>
      </div>
    </div>
  )
}

export default App
