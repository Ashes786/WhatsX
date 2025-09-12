'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { 
  Send, 
  FileText, 
  Upload, 
  Users, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Download,
  Eye,
  Copy
} from 'lucide-react'

interface Template {
  id: string
  title: string
  content: string
  is_active: boolean
  creator_name?: string
}

interface Contact {
  id: string
  name?: string
  raw_phone: string
  e164_phone?: string
  label?: string
}

interface PrepareResult {
  recipients_final: string[]
  duplicates: Array<{
    raw: string
    normalized?: string
    reason: 'duplicate_in_upload' | 'duplicate_existing_contact' | 'unparseable' | 'same_as_another_normalized'
  }>
  message_preview: string
}

export default function PrepareToSendPage() {
  const { data: session } = useSession()
  const [templates, setTemplates] = useState<Template[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [messageOverride, setMessageOverride] = useState('')
  const [recipientsRaw, setRecipientsRaw] = useState('')
  const [selectedContacts, setSelectedContacts] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PrepareResult | null>(null)
  const [activeTab, setActiveTab] = useState('compose')

  useEffect(() => {
    fetchTemplates()
    fetchContacts()
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

  const getSelectedTemplateContent = () => {
    const template = templates.find(t => t.id === selectedTemplate)
    return template?.content || ''
  }

  const getMessagePreview = () => {
    if (messageOverride) {
      return messageOverride
    }
    return getSelectedTemplateContent()
  }

  const handlePrepareToSend = async () => {
    setLoading(true)
    
    try {
      // Combine all recipients
      const allRecipients = [
        ...recipientsRaw.split('\n').filter(r => r.trim()),
        ...selectedContacts.map(contactId => {
          const contact = contacts.find(c => c.id === contactId)
          return contact?.raw_phone || ''
        }).filter(r => r)
      ]

      const response = await fetch('/api/prepare-to-send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          template_id: selectedTemplate || null,
          message_override: messageOverride || null,
          recipients_raw: allRecipients,
          default_country_code: session?.user.default_country_code || null
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setResult(data)
        setActiveTab('results')
      } else {
        const error = await response.json()
        alert(`Failed to prepare: ${error.error}`)
      }
    } catch (error) {
      console.error('Failed to prepare to send:', error)
      alert('Failed to prepare to send. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/contacts/upload-csv', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        alert(`Upload completed: ${result.imported_count} contacts imported, ${result.duplicate_count} duplicates found`)
        await fetchContacts()
        
        // Auto-select the imported contacts
        const newContactIds = result.imported_items.map((item: any) => item.id)
        setSelectedContacts(prev => [...prev, ...newContactIds])
      } else {
        const error = await response.json()
        alert(`Upload failed: ${error.error}`)
      }
    } catch (error) {
      console.error('Failed to upload CSV:', error)
      alert('Upload failed. Please try again.')
    }
  }

  const downloadRecipientsCSV = () => {
    if (!result) return

    const csvContent = result.recipients_final.map(phone => `Recipient\n${phone}`).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'final_recipients.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const downloadDuplicatesCSV = () => {
    if (!result) return

    const csvContent = 'Raw Number,Normalized Number,Reason\n' + 
      result.duplicates.map(d => `${d.raw},${d.normalized || ''},${d.reason}`).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'duplicates_report.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case 'duplicate_existing_contact':
        return 'bg-orange-100 text-orange-800'
      case 'duplicate_in_upload':
        return 'bg-yellow-100 text-yellow-800'
      case 'unparseable':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getReasonIcon = (reason: string) => {
    switch (reason) {
      case 'duplicate_existing_contact':
        return <Users className="h-4 w-4" />
      case 'duplicate_in_upload':
        return <Copy className="h-4 w-4" />
      case 'unparseable':
        return <XCircle className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Prepare to Send</h1>
        <p className="text-gray-600 mt-2">
          Compose your message and prepare recipients with duplicate detection
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="compose">Compose Message</TabsTrigger>
          <TabsTrigger value="results" disabled={!result}>Results</TabsTrigger>
        </TabsList>

        <TabsContent value="compose" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Message Composition */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Message Composition
                </CardTitle>
                <CardDescription>
                  Select a template and customize your message
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="template">Template (Optional)</Label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
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
                  <Label htmlFor="message">Message Preview</Label>
                  <Textarea
                    id="message"
                    value={getMessagePreview()}
                    onChange={(e) => setMessageOverride(e.target.value)}
                    rows={6}
                    placeholder="Type your message here or select a template above..."
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Use {{name}} for personalization
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Recipient Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Recipients
                </CardTitle>
                <CardDescription>
                  Add recipients manually, from contacts, or upload CSV
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="manual-recipients">Manual Entry (one per line)</Label>
                  <Textarea
                    id="manual-recipients"
                    value={recipientsRaw}
                    onChange={(e) => setRecipientsRaw(e.target.value)}
                    rows={4}
                    placeholder="+1234567890&#10;+1987654321&#10;+1555555555"
                  />
                </div>

                <div>
                  <Label>From Contacts</Label>
                  <div className="border rounded-md p-3 max-h-32 overflow-y-auto">
                    {contacts.length === 0 ? (
                      <p className="text-sm text-gray-500">No contacts available</p>
                    ) : (
                      <div className="space-y-2">
                        {contacts.map((contact) => (
                          <label key={contact.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={selectedContacts.includes(contact.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedContacts([...selectedContacts, contact.id])
                                } else {
                                  setSelectedContacts(selectedContacts.filter(id => id !== contact.id))
                                }
                              }}
                              className="rounded"
                            />
                            <span className="text-sm">
                              {contact.name || contact.raw_phone}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label>Upload CSV</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleCSVUpload}
                      className="flex-1"
                    />
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Prepare Button */}
          <div className="flex justify-center">
            <Button
              onClick={handlePrepareToSend}
              disabled={loading || (!getMessagePreview() && !selectedTemplate)}
              size="lg"
              className="px-8"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Preparing...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Prepare to Send
                </>
              )}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {result && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                      <div>
                        <p className="text-2xl font-bold">{result.recipients_final.length}</p>
                        <p className="text-sm text-gray-600">Final Recipients</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <XCircle className="h-8 w-8 text-red-600" />
                      <div>
                        <p className="text-2xl font-bold">{result.duplicates.length}</p>
                        <p className="text-sm text-gray-600">Duplicates Removed</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Eye className="h-8 w-8 text-blue-600" />
                      <div>
                        <p className="text-lg font-bold">Preview Ready</p>
                        <p className="text-sm text-gray-600">Message prepared</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Message Preview */}
              <Card>
                <CardHeader>
                  <CardTitle>Message Preview</CardTitle>
                  <CardDescription>
                    This is how your message will appear to recipients
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="whitespace-pre-wrap">{result.message_preview}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Final Recipients */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Final Recipients</CardTitle>
                      <CardDescription>
                        Deduplicated list of recipients who will receive the message
                      </CardDescription>
                    </div>
                    <Button variant="outline" onClick={downloadRecipientsCSV}>
                      <Download className="h-4 w-4 mr-2" />
                      Download CSV
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="max-h-64 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Phone Number</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {result.recipients_final.map((phone, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{phone}</TableCell>
                            <TableCell>
                              <Badge variant="default">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Ready
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Duplicates Report */}
              {result.duplicates.length > 0 && (
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Duplicates Report</CardTitle>
                        <CardDescription>
                          Numbers that were removed due to duplication issues
                        </CardDescription>
                      </div>
                      <Button variant="outline" onClick={downloadDuplicatesCSV}>
                        <Download className="h-4 w-4 mr-2" />
                        Download Report
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-64 overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Raw Number</TableHead>
                            <TableHead>Normalized</TableHead>
                            <TableHead>Reason</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {result.duplicates.map((duplicate, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{duplicate.raw}</TableCell>
                              <TableCell>{duplicate.normalized || '-'}</TableCell>
                              <TableCell>
                                <Badge className={getReasonColor(duplicate.reason)}>
                                  {getReasonIcon(duplicate.reason)}
                                  <span className="ml-1 capitalize">
                                    {duplicate.reason.replace(/_/g, ' ')}
                                  </span>
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex justify-center space-x-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setResult(null)
                    setActiveTab('compose')
                  }}
                >
                  Edit Message
                </Button>
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  <Send className="h-4 w-4 mr-2" />
                  Queue for Sending
                </Button>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}