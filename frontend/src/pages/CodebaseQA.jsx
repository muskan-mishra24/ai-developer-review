import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { repositoryAPI } from '../services/api'
import Navbar from '../components/Navbar'
import { ArrowLeft, Send, MessageCircle } from 'lucide-react'

export default function CodebaseQA() {
  const { repoId } = useParams()
  const navigate = useNavigate()
  const [repository, setRepository] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    fetchRepository()
  }, [repoId])

  const fetchRepository = async () => {
    try {
      const response = await repositoryAPI.getById(repoId)
      setRepository(response.data.repository)
      setMessages([
        {
          type: 'assistant',
          text: `Hello! I'm analyzing the ${response.data.repository.name} codebase. Ask me anything about the code structure, best practices, or specific issues.`
        }
      ])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    // Add user message to chat
    const userMessage = { type: 'user', text: input }
    setMessages([...messages, userMessage])
    setInput('')
    setSending(true)

    try {
      // TODO: Call RAG service with the question
      // For now, show a placeholder response
      const assistantMessage = {
        type: 'assistant',
        text: 'I\'m analyzing your question... This feature is coming soon! It will search through your codebase and provide context-aware answers.'
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (err) {
      console.error(err)
    } finally {
      setSending(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-secondary">
      <Navbar />
      <div className="text-center text-gray-400 py-12">Loading...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-secondary">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8 h-screen flex flex-col">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-primary hover:underline mb-6"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        {repository && (
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 mb-6">
            <div className="flex items-center gap-3">
              <MessageCircle className="text-primary" size={24} />
              <div>
                <h1 className="text-xl font-bold text-white">{repository.name}</h1>
                <p className="text-gray-400 text-sm">Ask questions about this codebase</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6 overflow-y-auto">
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md rounded-lg p-4 ${
                    msg.type === 'user'
                      ? 'bg-primary text-white'
                      : 'bg-gray-700 text-gray-100'
                  }`}
                >
                  <p>{msg.text}</p>
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="bg-gray-700 text-gray-100 rounded-lg p-4">
                  <p className="animate-pulse">Thinking...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about the codebase..."
            disabled={sending}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-primary focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  )
}
