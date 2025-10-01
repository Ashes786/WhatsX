'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  MessageSquare, 
  Send, 
  FileText, 
  Clock,
  CheckCircle,
  AlertCircle,
  Plus
} from 'lucide-react'

interface Template {
  id: string
  title: string
  content: string
  is_active: boolean
}

interface Message {
  id: string
  content: string
  created_at: string
  status: string
}

export default function MessagesPage() {
  const { data: session } = useSession()
  const [templates, setTemplates] = useState<Template[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [messageContent, setMessageContent] = useState('')
  const [recipient, setRecipient] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTemplates()
    fetchMessages()
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/templates')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data.filter(t => t.is_active))
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error)
    }
  }

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/messages')
      if (response.ok) {
        const data = await response.json()
        setMessages(data)
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!messageContent.trim() || !recipient.trim()) {
      alert('Please enter both message content and recipient')
      return
    }

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: messageContent,
          recipient: recipient,
          template_id: selectedTemplate || null
        }),
      })

      if (response.ok) {
        setMessageContent('')
        setRecipient('')
        setSelectedTemplate('')
        await fetchMessages()
        alert('Message sent successfully!')
      } else {
        const error = await response.json()
        alert(`Failed to send message: ${error.error}`)
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      alert('Failed to send message. Please try again.')
    }
  }

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId)
    const template = templates.find(t => t.id === templateId)
    if (template) {
      setMessageContent(template.content)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-green-100 text-green-800">Sent</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600 mt-2">
            Create and send individual messages to your contacts
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">Live</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{messages.length}</p>
                <p className="text-sm text-gray-600">Total Messages</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{messages.filter(m => m.status === 'sent').length}</p>
                <p className="text-sm text-gray-600">Messages Sent</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{templates.length}</p>
                <p className="text-sm text-gray-600">Available Templates</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Message Composition */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Compose Message
            </CardTitle>
            <CardDescription>
              Create a new message or use a template
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="template">Template (Optional)</Label>
              <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="message">Message Content</Label>
              <Textarea
                id="message"
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                rows={6}
                placeholder="Type your message here..."
              />
              <p className="text-sm text-gray-500 mt-1">
                Use {{name}} for personalization
              </p>
            </div>

            <div>
              <Label htmlFor="recipient">Recipient Phone Number</Label>
              <Input
                id="recipient"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="+1234567890"
              />
            </div>

            <Button 
              onClick={handleSendMessage}
              disabled={!messageContent.trim() || !recipient.trim()}
              className="w-full"
            >
              <Send className="h-4 w-4 mr-2" />
              Send Message
            </Button>
          </CardContent>
        </Card>

        {/* Recent Messages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Recent Messages
            </CardTitle>
            <CardDescription>
              Your recently sent messages
            </CardDescription>
          </CardHeader>
          <CardContent>
            {messages.length > 0 ? (
              <div className="space-y-4">
                {messages.slice(0, 5).map((message) => (
                  <div key={message.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-900">
                          {message.content.substring(0, 30)}...
                        </span>
                      </div>
                      {getStatusBadge(message.status)}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {message.content.substring(0, 100)}
                      {message.content.length > 100 && '...'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(message.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
                {messages.length > 5 && (
                  <div className="text-center">
                    <Button variant="outline" size="sm">
                      View All Messages
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No messages sent yet</p>
                <p className="text-sm text-gray-400">Send your first message using the composer</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}