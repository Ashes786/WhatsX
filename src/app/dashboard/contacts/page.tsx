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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  Phone,
  User,
  Upload,
  RadioGroup,
  List
} from 'lucide-react'

interface Contact {
  id: string
  name?: string
  raw_phone: string
  e164_phone?: string
  label?: string
  added_at: string
}

interface BroadcastList {
  id: string
  title: string
  createdAt: string
  broadcastContacts: Array<{
    contact: Contact
  }>
}

export default function ContactsPage() {
  const { data: session } = useSession()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [broadcastLists, setBroadcastLists] = useState<BroadcastList[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('contacts')
  
  // Contact management states
  const [isAddContactDialogOpen, setIsAddContactDialogOpen] = useState(false)
  const [isEditContactDialogOpen, setIsEditContactDialogOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    label: ''
  })

  // Broadcast list management states
  const [isCreateBroadcastDialogOpen, setIsCreateBroadcastDialogOpen] = useState(false)
  const [selectedContactsForBroadcast, setSelectedContactsForBroadcast] = useState<string[]>([])
  const [newBroadcastTitle, setNewBroadcastTitle] = useState('')
  const [creatingBroadcast, setCreatingBroadcast] = useState(false)

  useEffect(() => {
    fetchContacts()
    fetchBroadcastLists()
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
        setIsAddContactDialogOpen(false)
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
    setIsEditContactDialogOpen(true)
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
        setIsEditContactDialogOpen(false)
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
        await fetchBroadcastLists()
      } else {
        const error = await response.json()
        alert(`Failed to delete contact: ${error.error}`)
      }
    } catch (error) {
      console.error('Failed to delete contact:', error)
      alert('Failed to delete contact. Please try again.')
    }
  }

  const handleCreateBroadcastList = async () => {
    if (!newBroadcastTitle.trim() || selectedContactsForBroadcast.length === 0) {
      alert('Please enter a title and select at least one contact')
      return
    }

    setCreatingBroadcast(true)
    try {
      const response = await fetch('/api/broadcasts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newBroadcastTitle,
          contactIds: selectedContactsForBroadcast
        }),
      })

      if (response.ok) {
        await fetchBroadcastLists()
        setNewBroadcastTitle('')
        setSelectedContactsForBroadcast([])
        setIsCreateBroadcastDialogOpen(false)
        alert('Broadcast list created successfully!')
      } else {
        const error = await response.json()
        alert(`Failed to create broadcast list: ${error.error}`)
      }
    } catch (error) {
      console.error('Failed to create broadcast list:', error)
      alert('Failed to create broadcast list. Please try again.')
    } finally {
      setCreatingBroadcast(false)
    }
  }

  const handleDeleteBroadcastList = async (broadcastList: BroadcastList) => {
    if (!confirm(`Are you sure you want to delete "${broadcastList.title}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/broadcasts/${broadcastList.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchBroadcastLists()
      } else {
        const error = await response.json()
        alert(`Failed to delete broadcast list: ${error.error}`)
      }
    } catch (error) {
      console.error('Failed to delete broadcast list:', error)
      alert('Failed to delete broadcast list. Please try again.')
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
            <h1 className="text-2xl font-semibold text-gray-900">Contacts Management</h1>
            <p className="text-gray-600 mt-1">
              Manage your contacts and create broadcast lists for messaging campaigns
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
            <Dialog open={isAddContactDialogOpen} onOpenChange={setIsAddContactDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
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
                    <Button variant="outline" onClick={() => setIsAddContactDialogOpen(false)}>
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="broadcasts">Broadcast Lists</TabsTrigger>
        </TabsList>

        <TabsContent value="contacts" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-blue-200 bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-900">Total Contacts</CardTitle>
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Users className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{contacts.length}</div>
                <p className="text-xs text-gray-600">All contacts in your list</p>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-900">Named Contacts</CardTitle>
                <div className="p-2 bg-blue-600 rounded-lg">
                  <User className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{contacts.filter(c => c.name).length}</div>
                <p className="text-xs text-gray-600">Contacts with names</p>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-900">Broadcast Lists</CardTitle>
                <div className="p-2 bg-blue-600 rounded-lg">
                  <List className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{broadcastLists.length}</div>
                <p className="text-xs text-gray-600">Lists created</p>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter */}
          <Card className="border-blue-200 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Search className="h-5 w-5 text-white" />
                </div>
                Search Contacts
              </CardTitle>
              <CardDescription className="text-gray-600">
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
                              <span>{contact.raw_phone}</span>
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
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditContact(contact)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteContact(contact)}
                                className="text-red-600 hover:text-red-700"
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
                          <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <Users className="h-8 w-8" />
                            <p>No contacts found</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="broadcasts" className="space-y-6">
          {/* Broadcast Lists Header */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Broadcast Lists</h2>
              <p className="text-gray-600 mt-1">Create and manage contact groups for bulk messaging</p>
            </div>
            <Dialog open={isCreateBroadcastDialogOpen} onOpenChange={setIsCreateBroadcastDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4" />
                  Create Broadcast List
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <List className="h-5 w-5" />
                    Create Broadcast List
                  </DialogTitle>
                  <DialogDescription>
                    Create a new broadcast list by selecting contacts
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="broadcast-title">List Title *</Label>
                    <Input
                      id="broadcast-title"
                      value={newBroadcastTitle}
                      onChange={(e) => setNewBroadcastTitle(e.target.value)}
                      placeholder="e.g., VIP Customers, Team Members"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Select Contacts *</Label>
                    <div className="mt-2 max-h-60 overflow-y-auto border rounded-md p-3">
                      {contacts.length > 0 ? (
                        <div className="space-y-2">
                          {contacts.map((contact) => (
                            <div key={contact.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`contact-${contact.id}`}
                                checked={selectedContactsForBroadcast.includes(contact.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedContactsForBroadcast(prev => [...prev, contact.id])
                                  } else {
                                    setSelectedContactsForBroadcast(prev => 
                                      prev.filter(id => id !== contact.id)
                                    )
                                  }
                                }}
                              />
                              <Label 
                                htmlFor={`contact-${contact.id}`}
                                className="flex-1 cursor-pointer"
                              >
                                <div className="flex items-center justify-between">
                                  <span>
                                    {contact.name || 'No name'} - {contact.raw_phone}
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
                          No contacts available. Add some contacts first.
                        </p>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedContactsForBroadcast.length} contact{selectedContactsForBroadcast.length !== 1 ? 's' : ''} selected
                    </p>
                  </div>
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline" onClick={() => {
                      setIsCreateBroadcastDialogOpen(false)
                      setNewBroadcastTitle('')
                      setSelectedContactsForBroadcast([])
                    }}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleCreateBroadcastList}
                      disabled={!newBroadcastTitle.trim() || selectedContactsForBroadcast.length === 0 || creatingBroadcast}
                    >
                      {creatingBroadcast ? 'Creating...' : 'Create List'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Broadcast Lists Grid */}
          {broadcastLists.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {broadcastLists.map((broadcastList) => (
                <Card key={broadcastList.id} className="border-blue-200 bg-white">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{broadcastList.title}</CardTitle>
                        <CardDescription>
                          {broadcastList.broadcastContacts.length} contact{broadcastList.broadcastContacts.length !== 1 ? 's' : ''}
                        </CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteBroadcastList(broadcastList)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-900">Contacts:</div>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {broadcastList.broadcastContacts.map((bc) => (
                          <div key={bc.contact.id} className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">
                              {bc.contact.name || 'No name'}
                            </span>
                            <span className="text-muted-foreground text-xs">
                              {bc.contact.raw_phone}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
                      Created: {new Date(broadcastList.createdAt).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <List className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No broadcast lists yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Create your first broadcast list to organize contacts for bulk messaging
                </p>
                <Button 
                  onClick={() => setIsCreateBroadcastDialogOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Broadcast List
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Contact Dialog */}
      <Dialog open={isEditContactDialogOpen} onOpenChange={setIsEditContactDialogOpen}>
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
                setIsEditContactDialogOpen(false)
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
    </div>
  )
}