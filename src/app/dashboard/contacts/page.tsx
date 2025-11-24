'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  Phone,
  User,
  Upload
} from 'lucide-react'

interface Contact {
  id: string
  name?: string
  raw_phone: string
  e164_phone?: string
  label?: string
  added_at: string
}

export default function ContactsPage() {
  const { data: session } = useSession()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
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

  const handleAddContact = async () => {
    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newContact.name || null,
          raw_phone: newContact.phone,
          label: newContact.label || null
        }),
      })

      if (response.ok) {
        await fetchContacts()
        setNewContact({ name: '', phone: '', label: '' })
        setIsAddDialogOpen(false)
      } else {
        const error = await response.json()
        alert(`Failed to add contact: ${error.error}`)
      }
    } catch (error) {
      console.error('Failed to add contact:', error)
      alert('Failed to add contact. Please try again.')
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
      } else {
        const error = await response.json()
        alert(`Upload failed: ${error.error}`)
      }
    } catch (error) {
      console.error('Failed to upload CSV:', error)
      alert('Upload failed. Please try again.')
    }
  }

  const handleEditContact = (contact: Contact) => {
    setSelectedContact(contact)
    setNewContact({
      name: contact.name || '',
      phone: contact.raw_phone,
      label: contact.label || ''
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateContact = async () => {
    if (!selectedContact) return

    try {
      const response = await fetch(`/api/contacts/${selectedContact.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newContact.name || null,
          raw_phone: newContact.phone,
          label: newContact.label || null
        }),
      })

      if (response.ok) {
        await fetchContacts()
        setIsEditDialogOpen(false)
        setSelectedContact(null)
        setNewContact({ name: '', phone: '', label: '' })
      } else {
        const error = await response.json()
        alert(`Failed to update contact: ${error.error}`)
      }
    } catch (error) {
      console.error('Failed to update contact:', error)
      alert('Failed to update contact. Please try again.')
    }
  }

  const handleDeleteContact = async (contact: Contact) => {
    if (!confirm(`Are you sure you want to delete ${contact.name || 'this contact'}?`)) {
      return
    }

    try {
      const response = await fetch(`/api/contacts/${contact.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchContacts()
      } else {
        const error = await response.json()
        alert(`Failed to delete contact: ${error.error}`)
      }
    } catch (error) {
      console.error('Failed to delete contact:', error)
      alert('Failed to delete contact. Please try again.')
    }
  }

  const filteredContacts = contacts.filter(contact =>
    (contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     contact.raw_phone.includes(searchTerm) ||
     contact.label?.toLowerCase().includes(searchTerm.toLowerCase()))
  )

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
            <h1 className="text-2xl font-semibold text-foreground">Contacts</h1>
            <p className="text-muted-foreground mt-1">
              Manage your contact list and organize recipients for messaging campaigns
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleCSVUpload}
              className="hidden"
              id="csv-upload"
            />
            <Button
              variant="outline"
              onClick={() => document.getElementById('csv-upload')?.click()}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload CSV
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Contact
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Add New Contact
                  </DialogTitle>
                  <DialogDescription>
                    Add a new contact to your contact list
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name (Optional)</Label>
                    <Input
                      id="name"
                      value={newContact.name}
                      onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="John Doe"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={newContact.phone}
                      onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+1234567890"
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="label">Label (Optional)</Label>
                    <Input
                      id="label"
                      value={newContact.label}
                      onChange={(e) => setNewContact(prev => ({ ...prev, label: e.target.value }))}
                      placeholder="Friend, Client, etc."
                      className="mt-1"
                    />
                  </div>
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddContact}>
                      Add Contact
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Edit Contact Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit Contact
            </DialogTitle>
            <DialogDescription>
              Update contact information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Name (Optional)</Label>
              <Input
                id="edit-name"
                value={newContact.name}
                onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                placeholder="John Doe"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="edit-phone">Phone Number *</Label>
              <Input
                id="edit-phone"
                value={newContact.phone}
                onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+1234567890"
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="edit-label">Label (Optional)</Label>
              <Input
                id="edit-label"
                value={newContact.label}
                onChange={(e) => setNewContact(prev => ({ ...prev, label: e.target.value }))}
                placeholder="Friend, Client, etc."
                className="mt-1"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => {
                setIsEditDialogOpen(false)
                setSelectedContact(null)
                setNewContact({ name: '', phone: '', label: '' })
              }}>
                Cancel
              </Button>
              <Button onClick={handleUpdateContact}>
                Update Contact
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{contacts.length}</div>
              <p className="text-xs text-muted-foreground">All contacts in your list</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Named Contacts</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{contacts.filter(c => c.name).length}</div>
              <p className="text-xs text-muted-foreground">Contacts with names</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Labeled Contacts</CardTitle>
              <Badge className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{contacts.filter(c => c.label).length}</div>
              <p className="text-xs text-muted-foreground">Organized with labels</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Contacts
            </CardTitle>
            <CardDescription>
              Find contacts by name, phone number, or label
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contacts Table */}
        <Card>
          <CardHeader>
            <CardTitle>Contacts List</CardTitle>
            <CardDescription>
              {filteredContacts.length} {filteredContacts.length === 1 ? 'contact' : 'contacts'} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone Number</TableHead>
                    <TableHead>Label</TableHead>
                    <TableHead>Added Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContacts.length > 0 ? (
                    filteredContacts.map((contact) => (
                      <TableRow key={contact.id}>
                        <TableCell className="font-medium">
                          {contact.name || (
                            <span className="text-muted-foreground">No name</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            {contact.raw_phone}
                          </div>
                        </TableCell>
                        <TableCell>
                          {contact.label ? (
                            <Badge variant="secondary">{contact.label}</Badge>
                          ) : (
                            <span className="text-muted-foreground">No label</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(contact.added_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditContact(contact)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteContact(contact)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <Users className="h-8 w-8 text-muted-foreground" />
                          <p className="text-muted-foreground">No contacts found</p>
                          <p className="text-sm text-muted-foreground">
                            {searchTerm ? 'Try adjusting your search terms' : 'Add your first contact to get started'}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}