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
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

interface Contact {
  id: string
  name: string
  phoneNumber: string
  label?: string
  createdAt: string
  updatedAt: string
}

interface UploadResult {
  added: Contact[]
  duplicates: Array<{ contact: any; existing: Contact }>
  errors: Array<{ contact: any; error: string }>
}

export default function ContactsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    label: ''
  })
  const [csvData, setCsvData] = useState('')
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    fetchContacts()
  }, [session, status, router])

  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/contacts')
      if (response.ok) {
        const data = await response.json()
        setContacts(data)
      }
    } catch (error) {
      toast.error('Failed to fetch contacts')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingContact ? `/api/contacts/${editingContact.id}` : '/api/contacts'
      const method = editingContact ? 'PUT' : 'POST'
      
      // For single contact creation, we need to format it as an array
      const payload = editingContact 
        ? formData 
        : { contacts: [formData] }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        const result = await response.json()
        
        if (editingContact) {
          toast.success('Contact updated successfully')
        } else {
          if (result.added?.length > 0) {
            toast.success('Contact added successfully')
          } else if (result.duplicates?.length > 0) {
            toast.error('This contact already exists')
          } else if (result.errors?.length > 0) {
            toast.error('Failed to add contact')
          }
        }
        
        setIsDialogOpen(false)
        setEditingContact(null)
        setFormData({ name: '', phoneNumber: '', label: '' })
        fetchContacts()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Operation failed')
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact)
    setFormData({
      name: contact.name,
      phoneNumber: contact.phoneNumber,
      label: contact.label || ''
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (contactId: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return

    try {
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Contact deleted successfully')
        fetchContacts()
      } else {
        toast.error('Failed to delete contact')
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  const openDialog = () => {
    setEditingContact(null)
    setFormData({ name: '', phoneNumber: '', label: '' })
    setIsDialogOpen(true)
  }

  const parseCSV = (csvText: string) => {
    const lines = csvText.trim().split('\n')
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    
    const contacts = []
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      const contact: any = {}
      
      headers.forEach((header, index) => {
        if (header.includes('name')) {
          contact.name = values[index]
        } else if (header.includes('phone') || header.includes('number')) {
          contact.phoneNumber = values[index]
        } else if (header.includes('label') || header.includes('tag')) {
          contact.label = values[index]
        }
      })
      
      if (contact.name && contact.phoneNumber) {
        contacts.push(contact)
      }
    }
    
    return contacts
  }

  const handleCSVUpload = async () => {
    if (!csvData.trim()) {
      toast.error('Please enter CSV data')
      return
    }

    try {
      const contacts = parseCSV(csvData)
      
      if (contacts.length === 0) {
        toast.error('No valid contacts found in CSV data')
        return
      }

      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contacts }),
      })

      if (response.ok) {
        const result: UploadResult = await response.json()
        setUploadResult(result)
        
        if (result.added.length > 0) {
          toast.success(`${result.added.length} contacts added successfully`)
        }
        
        if (result.duplicates.length > 0) {
          toast.warning(`${result.duplicates.length} duplicates found and skipped`)
        }
        
        if (result.errors.length > 0) {
          toast.error(`${result.errors.length} contacts failed to add`)
        }
        
        fetchContacts()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to upload contacts')
      }
    } catch (error) {
      toast.error('An error occurred while processing CSV')
    }
  }

  if (status === 'loading' || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => router.push('/dashboard')}>
                ← Back to Dashboard
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Contact Management</h1>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openDialog}>Add Contact</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>
                      {editingContact ? 'Edit Contact' : 'Add New Contact'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingContact ? 'Update contact information' : 'Add a new contact to your list'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Name
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="col-span-3"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="phoneNumber" className="text-right">
                        Phone
                      </Label>
                      <Input
                        id="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        className="col-span-3"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="label" className="text-right">
                        Label
                      </Label>
                      <Input
                        id="label"
                        value={formData.label}
                        onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                        className="col-span-3"
                        placeholder="e.g., Client, Lead"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">
                      {editingContact ? 'Update Contact' : 'Add Contact'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Tabs defaultValue="contacts" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="contacts">Contacts</TabsTrigger>
              <TabsTrigger value="upload">Upload Contacts</TabsTrigger>
            </TabsList>
            
            <TabsContent value="contacts" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Your Contacts</CardTitle>
                  <CardDescription>
                    Manage your contact list with automatic duplicate detection
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Phone Number</TableHead>
                        <TableHead>Label</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contacts.map((contact) => (
                        <TableRow key={contact.id}>
                          <TableCell className="font-medium">{contact.name}</TableCell>
                          <TableCell>{contact.phoneNumber}</TableCell>
                          <TableCell>
                            {contact.label && (
                              <Badge variant="secondary">{contact.label}</Badge>
                            )}
                          </TableCell>
                          <TableCell>{new Date(contact.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(contact)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete(contact.id)}
                              >
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  {contacts.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">No contacts found</p>
                      <Button onClick={openDialog}>Add Your First Contact</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="upload" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Upload Contacts from CSV</CardTitle>
                  <CardDescription>
                    Upload multiple contacts at once. Duplicates will be automatically detected and skipped.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="csvData">CSV Data</Label>
                    <Textarea
                      id="csvData"
                      value={csvData}
                      onChange={(e) => setCsvData(e.target.value)}
                      rows={10}
                      placeholder="name,phone_number,label
John Doe,+1234567890,Client
Jane Smith,+0987654321,Lead"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Expected format: name, phone_number, label (label is optional)
                    </p>
                  </div>
                  
                  <Button onClick={handleCSVUpload}>Upload Contacts</Button>
                  
                  {uploadResult && (
                    <div className="mt-4 space-y-2">
                      <h4 className="font-semibold">Upload Results:</h4>
                      {uploadResult.added.length > 0 && (
                        <p className="text-green-600">
                          ✓ {uploadResult.added.length} contacts added successfully
                        </p>
                      )}
                      {uploadResult.duplicates.length > 0 && (
                        <p className="text-yellow-600">
                          ⚠ {uploadResult.duplicates.length} duplicates found and skipped
                        </p>
                      )}
                      {uploadResult.errors.length > 0 && (
                        <p className="text-red-600">
                          ✗ {uploadResult.errors.length} contacts failed to add
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}