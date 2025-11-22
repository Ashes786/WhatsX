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
  Plus,
  Users,
  Calendar
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
    <div className="space-y-6 h-full overflow-y-auto bg-background p-6">
      {/* Header */}
      <div className="border-b -mx-6 px-6 py-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Bulk Messaging</h1>
            <p className="text-muted-foreground mt-1">
              Send personalized messages to multiple contacts at once
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-muted-foreground">Live</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{messages.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Messages Sent</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{messages.filter(m => m.status === 'SENT').length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{messages.filter(m => m.status === 'SCHEDULED').length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{contacts.length}</div>
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
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Compose Message
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
                              <span className="text-xs text-muted-foreground">
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
                    <p className="text-sm text-muted-foreground mt-1">
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
                    <p className="text-sm text-muted-foreground mt-1">
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
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Select Recipients
                  </CardTitle>
                  <CardDescription>
                    Choose contacts or broadcast lists to send message to
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="broadcast-list">Broadcast List</Label>
                    <Select value={selectedBroadcastList} onValueChange={setSelectedBroadcastList}>
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

                  <div>
                    <Label>Individual Contacts</Label>
                    <div className="mt-2 space-y-2 max-h-48 overflow-y-auto border rounded-md p-2">
                      {contacts.map((contact) => (
                        <div key={contact.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={contact.id}
                            checked={selectedContacts.includes(contact.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedContacts([...selectedContacts, contact.id])
                              } else {
                                setSelectedContacts(selectedContacts.filter(id => id !== contact.id))
                              }
                            }}
                          />
                          <Label htmlFor={contact.id} className="text-sm">
                            {contact.name || contact.phoneNumber}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-muted rounded-md">
                    <p className="text-sm font-medium">
                      Selected Recipients: {getSelectedRecipientCount()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="scheduled" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Scheduled Messages</CardTitle>
                <CardDescription>
                  Messages scheduled for future delivery
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {messages.filter(m => m.status === 'SCHEDULED').map((message) => (
                    <div key={message.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium">{message.content}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Scheduled for: {message.scheduledAt ? new Date(message.scheduledAt).toLocaleString() : 'N/A'}
                          </p>
                        </div>
                        {getStatusBadge(message.status)}
                      </div>
                    </div>
                  ))}
                  {messages.filter(m => m.status === 'SCHEDULED').length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No scheduled messages
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Message History</CardTitle>
                <CardDescription>
                  All messages sent through the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium">{message.content}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Sent: {new Date(message.createdAt).toLocaleString()}
                          </p>
                          {message.deliveryLogs && (
                            <p className="text-sm text-muted-foreground">
                              Delivered to: {message.deliveryLogs.length} contacts
                            </p>
                          )}
                        </div>
                        {getStatusBadge(message.status)}
                      </div>
                    </div>
                  ))}
                  {messages.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No messages sent yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Template Creation Dialog */}
      <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Create Template
            </DialogTitle>
            <DialogDescription>
              Create a reusable message template
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateTemplate} className="space-y-4">
            <div>
              <Label htmlFor="template-title">Title</Label>
              <Input
                id="template-title"
                value={templateForm.title}
                onChange={(e) => setTemplateForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Template title"
                required
              />
            </div>
            <div>
              <Label htmlFor="template-content">Content</Label>
              <Textarea
                id="template-content"
                value={templateForm.content}
                onChange={(e) => setTemplateForm(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Template content"
                rows={4}
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsTemplateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={creatingTemplate}>
                {creatingTemplate ? 'Creating...' : 'Create Template'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}