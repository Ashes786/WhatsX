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
  Calendar,
  Paperclip,
  X,
  Image as ImageIcon,
  File,
  Video
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
  mediaAttachments?: Array<{
    id: string
    fileUrl: string
    fileType: string
    sizeKb: number
  }>
}

interface UploadedFile {
  filename: string
  originalName: string
  size: number
  type: string
  url: string
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
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [uploadingFile, setUploadingFile] = useState(false)
  
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadingFile(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const fileInfo: UploadedFile = await response.json()
        setUploadedFiles(prev => [...prev, fileInfo])
      } else {
        const error = await response.json()
        alert(`Upload failed: ${error.error}`)
      }
    } catch (error) {
      console.error('Failed to upload file:', error)
      alert('Upload failed. Please try again.')
    } finally {
      setUploadingFile(false)
      // Reset the file input
      event.target.value = ''
    }
  }

  const removeFile = (filename: string) => {
    setUploadedFiles(prev => prev.filter(file => file.filename !== filename))
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <ImageIcon className="h-4 w-4" />
    } else if (fileType.startsWith('video/')) {
      return <Video className="h-4 w-4" />
    } else {
      return <File className="h-4 w-4" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleSendMessage = async (isScheduled = false) => {
    if (!messageContent.trim() || (selectedContacts.length === 0 && !selectedBroadcastList)) {
      alert('Please enter message content and select recipients')
      return
    }

    setSending(true)
    try {
      const mediaAttachments = uploadedFiles.map(file => ({
        fileUrl: file.url,
        fileType: file.type,
        sizeKb: Math.round(file.size / 1024)
      }))

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
          templateVariables: selectedTemplate ? { name: 'Customer' } : undefined,
          mediaAttachments: mediaAttachments.length > 0 ? mediaAttachments : undefined
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setMessageContent('')
        setSelectedContacts([])
        setSelectedBroadcastList('')
        setSelectedTemplate('')
        setScheduledAt('')
        setUploadedFiles([])
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
            <h1 className="text-2xl font-semibold text-gray-900">Bulk Messaging</h1>
            <p className="text-gray-600 mt-1">
              Send personalized messages with attachments to multiple contacts at once
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Live</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-blue-200 bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900">Total Messages</CardTitle>
              <div className="p-2 bg-blue-600 rounded-lg">
                <MessageSquare className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{messages.length}</div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900">Messages Sent</CardTitle>
              <div className="p-2 bg-blue-600 rounded-lg">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{messages.filter(m => m.status === 'SENT').length}</div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900">Scheduled</CardTitle>
              <div className="p-2 bg-blue-600 rounded-lg">
                <Clock className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{messages.filter(m => m.status === 'SCHEDULED').length}</div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900">Total Contacts</CardTitle>
              <div className="p-2 bg-blue-600 rounded-lg">
                <Users className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{contacts.length}</div>
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
              <Card className="border-blue-200 bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <div className="p-2 bg-blue-600 rounded-lg">
                      <MessageSquare className="h-5 w-5 text-white" />
                    </div>
                    Compose Message
                  </CardTitle>
                  <CardDescription className="text-gray-600">
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

                  {/* File Attachments */}
                  <div>
                    <Label htmlFor="file-upload">Attachments (Optional)</Label>
                    <div className="mt-2">
                      <input
                        id="file-upload"
                        type="file"
                        onChange={handleFileUpload}
                        disabled={uploadingFile}
                        className="hidden"
                        accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('file-upload')?.click()}
                        disabled={uploadingFile}
                        className="w-full"
                      >
                        <Paperclip className="h-4 w-4 mr-2" />
                        {uploadingFile ? 'Uploading...' : 'Attach File'}
                      </Button>
                      <p className="text-xs text-muted-foreground mt-1">
                        Supported: Images, Videos, PDFs, Documents (Max 10MB)
                      </p>
                    </div>

                    {/* Uploaded Files */}
                    {uploadedFiles.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <Label>Attached Files:</Label>
                        {uploadedFiles.map((file) => (
                          <div key={file.filename} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                            <div className="flex items-center gap-2">
                              {getFileIcon(file.type)}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{file.originalName}</p>
                                <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(file.filename)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
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
                      disabled={!messageContent.trim() || getSelectedRecipientCount() === 0 || sending}
                      variant="outline"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recipients Selection */}
              <Card className="border-blue-200 bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <div className="p-2 bg-blue-600 rounded-lg">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    Select Recipients
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Choose contacts or broadcast lists to send the message to
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
                            <div className="flex flex-col">
                              <span>{list.title}</span>
                              <span className="text-xs text-muted-foreground">
                                {list.broadcastContacts.length} contacts
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="text-center text-sm text-muted-foreground">
                    OR
                  </div>

                  <div>
                    <Label>Individual Contacts</Label>
                    <div className="mt-2 max-h-60 overflow-y-auto border rounded-md p-3">
                      {contacts.length > 0 ? (
                        <div className="space-y-2">
                          {contacts.map((contact) => (
                            <div key={contact.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`contact-${contact.id}`}
                                checked={selectedContacts.includes(contact.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedContacts(prev => [...prev, contact.id])
                                  } else {
                                    setSelectedContacts(prev => 
                                      prev.filter(id => id !== contact.id)
                                    )
                                  }
                                }}
                                disabled={selectedBroadcastList !== ''}
                              />
                              <Label 
                                htmlFor={`contact-${contact.id}`}
                                className="flex-1 cursor-pointer"
                              >
                                <div className="flex items-center justify-between">
                                  <span>
                                    {contact.name || 'No name'} - {contact.phoneNumber}
                                  </span>
                                  {contact.label && (
                                    <Badge variant="secondary" className="text-xs">
                                      {contact.label}
                                    </Badge>
                                  )}
                                </div>
                              </Label>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-center py-4">
                          No contacts available
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50 rounded-md">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">
                        {getSelectedRecipientCount()} recipient{getSelectedRecipientCount() !== 1 ? 's' : ''} selected
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="scheduled" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Scheduled Messages</CardTitle>
                <CardDescription>
                  Messages scheduled for future delivery
                </CardDescription>
              </CardHeader>
              <CardContent>
                {messages.filter(m => m.status === 'SCHEDULED').length > 0 ? (
                  <div className="space-y-4">
                    {messages.filter(m => m.status === 'SCHEDULED').map((message) => (
                      <div key={message.id} className="border rounded-md p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <p className="text-sm text-gray-900 mb-1">{message.content}</p>
                            {message.mediaAttachments && message.mediaAttachments.length > 0 && (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Paperclip className="h-3 w-3" />
                                {message.mediaAttachments.length} file{message.mediaAttachments.length !== 1 ? 's' : ''} attached
                              </div>
                            )}
                          </div>
                          {getStatusBadge(message.status)}
                        </div>
                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                          <span>Scheduled for: {message.scheduledAt ? new Date(message.scheduledAt).toLocaleString() : 'N/A'}</span>
                          <span>{message.deliveryLogs.length} recipients</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No scheduled messages</h3>
                    <p className="text-muted-foreground">
                      Schedule messages to see them here
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Message History</CardTitle>
                <CardDescription>
                  View all sent messages and their delivery status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {messages.filter(m => m.status === 'SENT').length > 0 ? (
                  <div className="space-y-4">
                    {messages.filter(m => m.status === 'SENT').map((message) => (
                      <div key={message.id} className="border rounded-md p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <p className="text-sm text-gray-900 mb-1">{message.content}</p>
                            {message.mediaAttachments && message.mediaAttachments.length > 0 && (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Paperclip className="h-3 w-3" />
                                {message.mediaAttachments.length} file{message.mediaAttachments.length !== 1 ? 's' : ''} attached
                              </div>
                            )}
                          </div>
                          {getStatusBadge(message.status)}
                        </div>
                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                          <span>Sent: {new Date(message.createdAt).toLocaleString()}</span>
                          <span>{message.deliveryLogs.length} recipients</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No message history</h3>
                    <p className="text-muted-foreground">
                      Send messages to see them here
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Template Dialog */}
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
                placeholder="Welcome Message"
                required
              />
            </div>
            <div>
              <Label htmlFor="template-content">Content</Label>
              <Textarea
                id="template-content"
                value={templateForm.content}
                onChange={(e) => setTemplateForm(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Hello {name}, welcome to our service!"
                rows={4}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use {'{variable}'} for placeholders
              </p>
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