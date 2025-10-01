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
  Mail,
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
          <p className="text-gray-600 mt-2">
            Manage your contact list and organize recipients for messaging campaigns
          </p>
        </div>
        <div className="flex items-center space-x-3">
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
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Contact</DialogTitle>
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
                  />
                </div>
                <div>
                  <Label htmlFor="label">Label (Optional)</Label>
                  <Input
                    id="label"
                    value={newContact.label}
                    onChange={(e) => setNewContact(prev => ({ ...prev, label: e.target.value }))}
                    placeholder="Friend, Client, etc."
                  />
                </div>
                <div className="flex justify-end space-x-2">
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{contacts.length}</p>
                <p className="text-sm text-gray-600">Total Contacts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-full">
                <Phone className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{contacts.filter(c => c.name).length}</p>
                <p className="text-sm text-gray-600">Named Contacts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <Mail className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{contacts.filter(c => c.label).length}</p>
                <p className="text-sm text-gray-600">Labeled Contacts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="h-5 w-5 mr-2" />
            Search Contacts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, phone, or label..."
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
          <CardTitle>All Contacts</CardTitle>
          <CardDescription>
            {filteredContacts.length} contact{filteredContacts.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredContacts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Label</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gray-100 rounded-full">
                          <User className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium">{contact.name || 'Unnamed'}</p>
                          <p className="text-sm text-gray-500">ID: {contact.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="font-mono">{contact.raw_phone}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {contact.label ? (
                        <Badge variant="secondary">{contact.label}</Badge>
                      ) : (
                        <span className="text-gray-400">No label</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(contact.added_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No contacts found</p>
              <p className="text-sm text-gray-400">Try adjusting your search or add a new contact</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}