'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { ArrowLeft, Send } from 'lucide-react'

interface Contact {
  id: string
  name: string
  raw_phone: string
  label?: string
}

interface Template {
  id: string
  title: string
  content: string
}

interface Message {
  id: string
  content: string
  status: string
  createdAt: string
  recipients: Array<{
    contact: Contact
    status: string
  }>
}

export default function MessagesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedContacts, setSelectedContacts] = useState<string[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [messageContent, setMessageContent] = useState('')
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    fetchData()
  }, [session, status, router])

  const fetchData = async () => {
    try {
      const [contactsRes, templatesRes, messagesRes] = await Promise.all([
        fetch('/api/contacts'),
        fetch('/api/templates'),
        fetch('/api/messages'),
      ])

      if (contactsRes.ok) setContacts(await contactsRes.json())
      if (templatesRes.ok) setTemplates(await templatesRes.json())
      if (messagesRes.ok) setMessages(await messagesRes.json())
    } catch (error) {
      toast.error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId)
    const template = templates.find(t => t.id === templateId)
    if (template) {
      setMessageContent(template.content)
    }
  }

  const handleContactToggle = (contactId: string, checked: boolean) => {
    if (checked) {
      setSelectedContacts([...selectedContacts, contactId])
    } else {
      setSelectedContacts(selectedContacts.filter(id => id !== contactId))
    }
  }

  const selectAllContacts = () => {
    if (selectedContacts.length === contacts.length) {
      setSelectedContacts([])
    } else {
      setSelectedContacts(contacts.map(c => c.id))
    }
  }

  const handleSendMessage = async () => {
    if (!messageContent.trim()) {
      toast.error('Message content is required')
      return
    }

    if (selectedContacts.length === 0) {
      toast.error('Please select at least one contact')
      return
    }

    setIsSending(true)

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: messageContent,
          contactIds: selectedContacts,
          templateId: selectedTemplate || null,
        }),
      })

      if (response.ok) {
        toast.success('Message created successfully')
        setIsDialogOpen(false)
        setSelectedContacts([])
        setSelectedTemplate('')
        setMessageContent('')
        fetchData()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to create message')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setIsSending(false)
    }
  }

  const openDialog = () => {
    setSelectedContacts([])
    setSelectedTemplate('')
    setMessageContent('')
    setIsDialogOpen(true)
  }

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
      'DRAFT': 'secondary',
      'SENT': 'default',
      'FAILED': 'destructive',
      'PENDING': 'outline',
    }
    
    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status}
      </Badge>
    )
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-xl font-bold text-gray-900">Messages</h1>
        </div>
        <Button onClick={openDialog}>
          <Send className="h-4 w-4 mr-2" />
          Compose
        </Button>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => router.push('/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
              <p className="text-sm text-gray-600 mt-1">Manage your message history and compose new messages</p>
            </div>
          </div>
          <Button onClick={openDialog} size="lg">
            <Send className="h-4 w-4 mr-2" />
            Compose Message
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <main className="h-full overflow-y-auto bg-gray-50">
        <div className="p-4 lg:p-8">
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Send className="h-6 w-6 mr-3 text-blue-600" />
                Message History
              </CardTitle>
              <CardDescription>
                View your composed messages and their delivery status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Content</TableHead>
                      <TableHead>Recipients</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {messages.map((message) => (
                      <TableRow key={message.id}>
                        <TableCell>
                          <div className="max-w-xs truncate">
                            {message.content}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {message.recipients.slice(0, 2).map((recipient, index) => (
                              <div key={index} className="text-sm">
                                {recipient.contact.name || recipient.contact.raw_phone} ({recipient.contact.raw_phone})
                                <Badge variant="outline" className="ml-2 text-xs">
                                  {recipient.status}
                                </Badge>
                              </div>
                            ))}
                            {message.recipients.length > 2 && (
                              <div className="text-xs text-gray-500">
                                +{message.recipients.length - 2} more
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(message.status)}
                        </TableCell>
                        <TableCell>
                          {new Date(message.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {messages.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No messages found</p>
                    <Button onClick={openDialog} size="lg">
                      <Send className="h-4 w-4 mr-2" />
                      Create Your First Message
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Compose Message Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Send className="h-5 w-5 mr-2 text-blue-600" />
              Compose New Message
            </DialogTitle>
            <DialogDescription>
              Create a new message using templates or custom content
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Template Selection */}
            <div className="space-y-2">
              <Label htmlFor="template">Select Template (Optional)</Label>
              <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a template or write custom message" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Custom Message</SelectItem>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Message Content */}
            <div className="space-y-2">
              <Label htmlFor="content">Message Content</Label>
              <Textarea
                id="content"
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                rows={6}
                placeholder="Enter your message content..."
                required
                className="resize-none"
              />
            </div>

            {/* Contact Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Select Recipients</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAllContacts}
                >
                  {selectedContacts.length === contacts.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
              
              <div className="max-h-60 overflow-y-auto border rounded-md p-2 space-y-2 bg-gray-50">
                {contacts.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No contacts found</p>
                ) : (
                  contacts.map((contact) => (
                    <div key={contact.id} className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded transition-colors">
                      <Checkbox
                        id={`contact-${contact.id}`}
                        checked={selectedContacts.includes(contact.id)}
                        onCheckedChange={(checked) => handleContactToggle(contact.id, checked as boolean)}
                      />
                      <div className="flex-1">
                        <label
                          htmlFor={`contact-${contact.id}`}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {contact.name || contact.raw_phone}
                        </label>
                        <div className="text-xs text-gray-500">
                          {contact.raw_phone} {contact.label && `• ${contact.label}`}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {selectedContacts.length > 0 && (
                <p className="text-sm text-gray-600">
                  {selectedContacts.length} contact{selectedContacts.length !== 1 ? 's' : ''} selected
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button 
              onClick={handleSendMessage} 
              disabled={isSending || !messageContent.trim() || selectedContacts.length === 0}
              size="lg"
              className="px-8"
            >
              {isSending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Create Message
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}