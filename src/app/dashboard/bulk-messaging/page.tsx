'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  MessageSquare, 
  Send, 
  FileText, 
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Users,
  Calendar,
  Upload,
  X,
  Zap
} from 'lucide-react'

interface Template {
  id: string
  title: string
  content: string
  creator_name: string
  is_admin_template: boolean
  created_at: string
}

interface Contact {
  id: string
  name: string
  phoneNumber: string
  label: string
}

interface BroadcastList {
  id: string
  title: string
  createdAt: string
  broadcastContacts: Array<{
    contact: Contact
  }>
}

interface Message {
  id: string
  content: string
  createdAt: string
  status: string
  scheduledAt?: string
  deliveryLogs: Array<{
    contact: {
      name: string
      phoneNumber: string
    }
    status: string
  }>
}

export default function BulkMessagingPage() {
  const { data: session } = useSession()
  const [templates, setTemplates] = useState<Template[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [broadcastLists, setBroadcastLists] = useState<BroadcastList[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [messageContent, setMessageContent] = useState('')
  const [selectedContacts, setSelectedContacts] = useState<string[]>([])
  const [selectedBroadcastList, setSelectedBroadcastList] = useState<string>('')
  const [scheduledAt, setScheduledAt] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [activeTab, setActiveTab] = useState('compose')
  
  // Template creation dialog state
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false)
  const [templateForm, setTemplateForm] = useState({
    title: '',
    content: ''
  })
  const [creatingTemplate, setCreatingTemplate] = useState(false)

  useEffect(() => {
    fetchTemplates()
    fetchContacts()
    fetchBroadcastLists()
    fetchMessages()
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/templates')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data)
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error)
    }
  }

  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/contacts')
      if (response.ok) {
        const data = await response.json()
        setContacts(data)
      }
    } catch (error) {
      console.error('Failed to fetch contacts:', error)
    }
  }

  const fetchBroadcastLists = async () => {
    try {
      const response = await fetch('/api/broadcasts')
      if (response.ok) {
        const data = await response.json()
        setBroadcastLists(data)
      }
    } catch (error) {
      console.error('Failed to fetch broadcast lists:', error)
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

  const handleSendMessage = async (isScheduled = false) => {
    if (!messageContent.trim() || (selectedContacts.length === 0 && !selectedBroadcastList)) {
      alert('Please enter message content and select recipients')
      return
    }

    setSending(true)
    try {
      const response = await fetch('/api/bulk-messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: messageContent,
          contactIds: selectedContacts.length > 0 ? selectedContacts : undefined,
          broadcastListId: selectedBroadcastList || undefined,
          scheduledAt: isScheduled && scheduledAt ? scheduledAt : undefined,
          templateId: selectedTemplate || null,
          templateVariables: selectedTemplate ? { name: 'Customer' } : undefined
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setMessageContent('')
        setSelectedContacts([])
        setSelectedBroadcastList('')
        setSelectedTemplate('')
        setScheduledAt('')
        await fetchMessages()
        
        const message = isScheduled 
          ? `Message scheduled successfully! ${result.duplicateContactsRemoved > 0 ? `(${result.duplicateContactsRemoved} duplicates removed)` : ''}`
          : `Message sent successfully! ${result.duplicateContactsRemoved > 0 ? `(${result.duplicateContactsRemoved} duplicates removed)` : ''}`
        
        alert(message)
      } else {
        const error = await response.json()
        alert(`Failed to send message: ${error.error}`)
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      alert('Failed to send message. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId)
    const template = templates.find(t => t.id === templateId)
    if (template) {
      setMessageContent(template.content)
    }
  }

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreatingTemplate(true)
    
    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templateForm),
      })

      if (response.ok) {
        await fetchTemplates()
        setIsTemplateDialogOpen(false)
        setTemplateForm({ title: '', content: '' })
        alert('Template created successfully!')
      } else {
        const error = await response.json()
        alert(`Failed to create template: ${error.error}`)
      }
    } catch (error) {
      console.error('Failed to create template:', error)
      alert('Failed to create template. Please try again.')
    } finally {
      setCreatingTemplate(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SENT':
        return <Badge className="bg-green-100 text-green-800">Sent</Badge>
      case 'SCHEDULED':
        return <Badge className="bg-yellow-100 text-yellow-800">Scheduled</Badge>
      case 'DRAFT':
        return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>
      case 'FAILED':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const getSelectedRecipientCount = () => {
    let count = selectedContacts.length
    if (selectedBroadcastList) {
      const list = broadcastLists.find(bl => bl.id === selectedBroadcastList)
      if (list) {
        count += list.broadcastContacts.length
      }
    }
    return count
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
          <h1 className="text-3xl font-bold text-gray-900">Bulk Messaging</h1>
          <p className="text-gray-600 mt-2">
            Send personalized messages to multiple contacts at once
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">Live</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                <p className="text-2xl font-bold text-gray-900">{messages.filter(m => m.status === 'SENT').length}</p>
                <p className="text-sm text-gray-600">Messages Sent</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{messages.filter(m => m.status === 'SCHEDULED').length}</p>
                <p className="text-sm text-gray-600">Scheduled</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{contacts.length}</p>
                <p className="text-sm text-gray-600">Total Contacts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="compose">Compose</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="compose" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Message Composition */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Compose Bulk Message
                </CardTitle>
                <CardDescription>
                  Create a message and send to multiple contacts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label htmlFor="template">Template (Optional)</Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => setIsTemplateDialogOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Create Template
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">
                    Public templates (created by admins) are visible to all users. Your templates are private.
                  </p>
                  <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span>{template.title}</span>
                              {template.is_admin_template && (
                                <Badge variant="secondary" className="text-xs">
                                  Public
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs text-gray-500">
                              {template.is_admin_template ? `Admin • ${template.creator_name}` : `Your template`}
                            </span>
                          </div>
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
                    Use {'{name}'} for personalization
                  </p>
                </div>

                <div>
                  <Label htmlFor="schedule">Schedule (Optional)</Label>
                  <Input
                    id="schedule"
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Leave empty to send immediately
                  </p>
                </div>

                <div className="flex space-x-2">
                  <Button 
                    onClick={() => handleSendMessage(false)}
                    disabled={!messageContent.trim() || getSelectedRecipientCount() === 0 || sending}
                    className="flex-1"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {sending ? 'Sending...' : 'Send Now'}
                  </Button>
                  <Button 
                    onClick={() => handleSendMessage(true)}
                    disabled={!messageContent.trim() || getSelectedRecipientCount() === 0 || sending || !scheduledAt}
                    variant="outline"
                    className="flex-1"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    {sending ? 'Scheduling...' : 'Schedule'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recipient Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Select Recipients
                </CardTitle>
                <CardDescription>
                  Choose contacts or broadcast lists to send to
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="broadcast-list">Broadcast List</Label>
                  <Select value={selectedBroadcastList} onValueChange={(value) => {
                    setSelectedBroadcastList(value)
                    if (value) {
                      setSelectedContacts([]) // Clear individual contacts when using broadcast list
                    }
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a broadcast list" />
                    </SelectTrigger>
                    <SelectContent>
                      {broadcastLists.map((list) => (
                        <SelectItem key={list.id} value={list.id}>
                          {list.title} ({list.broadcastContacts.length} contacts)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="text-center text-sm text-gray-500">OR</div>

                <div>
                  <Label htmlFor="contacts">Individual Contacts</Label>
                  <div className="max-h-60 overflow-y-auto border rounded-md p-3 space-y-2">
                    {contacts.length > 0 ? (
                      contacts.map((contact) => (
                        <div key={contact.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={contact.id}
                            checked={selectedContacts.includes(contact.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedContacts([...selectedContacts, contact.id])
                                setSelectedBroadcastList('') // Clear broadcast list when selecting individual contacts
                              } else {
                                setSelectedContacts(selectedContacts.filter(id => id !== contact.id))
                              }
                            }}
                            disabled={!!selectedBroadcastList}
                          />
                          <Label htmlFor={contact.id} className="text-sm font-medium cursor-pointer flex-1">
                            {contact.name} ({contact.phoneNumber})
                            {contact.label && <span className="text-gray-500 ml-1">- {contact.label}</span>}
                          </Label>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">No contacts available. Add contacts first.</p>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Zap className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      {getSelectedRecipientCount()} recipient{getSelectedRecipientCount() !== 1 ? 's' : ''} selected
                    </span>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">
                    Duplicates will be automatically removed
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Scheduled Messages
              </CardTitle>
              <CardDescription>
                Messages scheduled for future delivery
              </CardDescription>
            </CardHeader>
            <CardContent>
              {messages.filter(m => m.status === 'SCHEDULED').length > 0 ? (
                <div className="space-y-4">
                  {messages.filter(m => m.status === 'SCHEDULED').map((message) => (
                    <div key={message.id} className="p-4 bg-yellow-50 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-yellow-600" />
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
                        Scheduled for: {message.scheduledAt ? new Date(message.scheduledAt).toLocaleString() : 'Unknown'}
                      </p>
                      <div className="mt-2 text-sm text-gray-600">
                        Will be sent to {message.deliveryLogs.length} contact{message.deliveryLogs.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No scheduled messages</p>
                  <p className="text-sm text-gray-400">Schedule a message to see it here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Message History
              </CardTitle>
              <CardDescription>
                Your recently sent messages
              </CardDescription>
            </CardHeader>
            <CardContent>
              {messages.length > 0 ? (
                <div className="space-y-4">
                  {messages.map((message) => (
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
                        {new Date(message.createdAt).toLocaleString()}
                      </p>
                      <div className="mt-2 text-sm text-gray-600">
                        Sent to {message.deliveryLogs.length} contact{message.deliveryLogs.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  ))}
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
        </TabsContent>
      </Tabs>

      {/* Template Creation Dialog */}
      <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Template</DialogTitle>
            <DialogDescription>
              Create a reusable message template. Your templates will be private and only visible to you.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateTemplate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="template-title">Template Title</Label>
              <Input
                id="template-title"
                type="text"
                value={templateForm.title}
                onChange={(e) => setTemplateForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter template title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-content">Template Content</Label>
              <Textarea
                id="template-content"
                value={templateForm.content}
                onChange={(e) => setTemplateForm(prev => ({ ...prev, content: e.target.value }))}
                rows={6}
                placeholder="Enter your message template here... Use {name} for personalization"
                required
              />
              <p className="text-sm text-gray-500">
                Use {'{name}'} for personalization. This template will be available for future messages.
              </p>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsTemplateDialogOpen(false)}
                disabled={creatingTemplate}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={creatingTemplate}>
                {creatingTemplate ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Create Template
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}