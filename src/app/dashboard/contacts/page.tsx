'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Edit, Trash2, Contacts, Upload, Download, Search } from 'lucide-react'

interface Contact {
  id: string
  name?: string
  raw_phone: string
  e164_phone?: string
  label?: string
  added_at: string
  updated_at: string
}

export default function ContactsPage() {
  const { data: session } = useSession()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    raw_phone: '',
    label: ''
  })

  useEffect(() => {
    fetchContacts()
  }, [])

  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/contacts')
      if (response.ok) {
        const data = await response.json()
        setContacts(data)
      }
    } catch (error) {
      console.error('Failed to fetch contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const url = editingContact ? `/api/contacts/${editingContact.id}` : '/api/contacts'
    const method = editingContact ? 'PUT' : 'POST'
    
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchContacts()
        setIsCreateDialogOpen(false)
        setEditingContact(null)
        setFormData({
          name: '',
          raw_phone: '',
          label: ''
        })
      }
    } catch (error) {
      console.error('Failed to save contact:', error)
    }
  }

  const handleDelete = async (contactId: string) => {
    try {
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchContacts()
      }
    } catch (error) {
      console.error('Failed to delete contact:', error)
    }
  }

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact)
    setFormData({
      name: contact.name || '',
      raw_phone: contact.raw_phone,
      label: contact.label || ''
    })
    setIsCreateDialogOpen(true)
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
      } else {
        const error = await response.json()
        alert(`Upload failed: ${error.error}`)
      }
    } catch (error) {
      console.error('Failed to upload CSV:', error)
      alert('Upload failed. Please try again.')
    }
  }

  const downloadSampleCSV = () => {
    const csvContent = `name,phone,label
John Doe,+1234567890,Friend
Jane Smith,+1987654321,Colleague
Bob Johnson,+1555555555,Family`
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sample_contacts.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const filteredContacts = contacts.filter(contact =>
    contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.raw_phone.includes(searchTerm) ||
    contact.label?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contact Management</h1>
          <p className="text-gray-600 mt-2">Manage your contacts and import from CSV files</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={downloadSampleCSV} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Sample CSV
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingContact(null)
                setFormData({
                  name: '',
                  raw_phone: '',
                  label: ''
                })
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Contact
              </Button>
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
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="raw_phone" className="text-right">
                      Phone
                    </Label>
                    <Input
                      id="raw_phone"
                      value={formData.raw_phone}
                      onChange={(e) => setFormData({ ...formData, raw_phone: e.target.value })}
                      className="col-span-3"
                      required
                      placeholder="+1234567890"
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
                      placeholder="Friend, Family, etc."
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

      <Tabs defaultValue="contacts" className="w-full">
        <TabsList>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="import">Import CSV</TabsTrigger>
        </TabsList>
        
        <TabsContent value="contacts" className="space-y-4">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Your Contacts</CardTitle>
              <CardDescription>Manage your contact list</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Normalized</TableHead>
                      <TableHead>Label</TableHead>
                      <TableHead>Added</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContacts.map((contact) => (
                      <TableRow key={contact.id}>
                        <TableCell className="font-medium">
                          {contact.name || <span className="text-gray-400">No name</span>}
                        </TableCell>
                        <TableCell>{contact.raw_phone}</TableCell>
                        <TableCell>
                          {contact.e164_phone ? (
                            <Badge variant="secondary">{contact.e164_phone}</Badge>
                          ) : (
                            <span className="text-gray-400">Not normalized</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {contact.label ? (
                            <Badge variant="outline">{contact.label}</Badge>
                          ) : (
                            <span className="text-gray-400">No label</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(contact.added_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(contact)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the contact
                                    "{contact.name || contact.raw_phone}".
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(contact.id)}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Import Contacts from CSV</CardTitle>
              <CardDescription>
                Upload a CSV file to import multiple contacts at once
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Drop your CSV file here or click to browse
                  </p>
                  <p className="text-xs text-gray-500">
                    Supported columns: name, phone, label
                  </p>
                </div>
                <div className="mt-4">
                  <Input
                    type="file"
                    accept=".csv"
                    onChange={handleCSVUpload}
                    className="max-w-xs mx-auto"
                  />
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">CSV Format Requirements:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• File must be in CSV format</li>
                  <li>• Required column: <code>phone</code></li>
                  <li>• Optional columns: <code>name</code>, <code>label</code></li>
                  <li>• Phone numbers will be normalized automatically</li>
                  <li>• Duplicates will be detected and flagged</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}