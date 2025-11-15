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
  Upload,
  Download,
  Filter
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
    <div className="space-y-6 h-full overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Enhanced Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 pt-6 pb-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact Management</h1>
              <p className="text-gray-600">
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
                className="flex items-center gap-2 border-2 hover:border-green-500 hover:bg-green-50 transition-all"
              >
                <Upload className="h-4 w-4" />
                Upload CSV
              </Button>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4" />
                    Add Contact
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center text-xl">
                      <div className="p-2 bg-blue-100 rounded-lg mr-3">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      Add New Contact
                    </DialogTitle>
                    <DialogDescription>
                      Add a new contact to your contact list
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name" className="text-sm font-medium">Name (Optional)</Label>
                      <Input
                        id="name"
                        value={newContact.name}
                        onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="John Doe"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-sm font-medium">Phone Number *</Label>
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
                      <Label htmlFor="label" className="text-sm font-medium">Label (Optional)</Label>
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
                      <Button onClick={handleAddContact} className="bg-blue-600 hover:bg-blue-700">
                        Add Contact
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-6">
        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-400 rounded-full opacity-20"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative">
              <CardTitle className="text-sm font-medium text-blue-100">Total Contacts</CardTitle>
              <div className="p-2 bg-blue-400 bg-opacity-30 rounded-lg group-hover:scale-110 transition-transform">
                <Users className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-4xl font-bold text-white mb-2">{contacts.length}</div>
              <p className="text-xs text-blue-100">All contacts in your list</p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-green-500 to-green-600 text-white overflow-hidden">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-green-400 rounded-full opacity-20"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative">
              <CardTitle className="text-sm font-medium text-green-100">Named Contacts</CardTitle>
              <div className="p-2 bg-green-400 bg-opacity-30 rounded-lg group-hover:scale-110 transition-transform">
                <User className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-4xl font-bold text-white mb-2">{contacts.filter(c => c.name).length}</div>
              <p className="text-xs text-green-100">Contacts with names</p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white overflow-hidden">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-purple-400 rounded-full opacity-20"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative">
              <CardTitle className="text-sm font-medium text-purple-100">Labeled Contacts</CardTitle>
              <div className="p-2 bg-purple-400 bg-opacity-30 rounded-lg group-hover:scale-110 transition-transform">
                <Mail className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-4xl font-bold text-white mb-2">{contacts.filter(c => c.label).length}</div>
              <p className="text-xs text-purple-100">Organized with labels</p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Search and Filter */}
        <Card className="shadow-xl border-0 bg-white">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <CardTitle className="flex items-center text-xl text-gray-900">
              <div className="p-2 bg-blue-600 rounded-lg mr-3">
                <Search className="h-5 w-5 text-white" />
              </div>
              Search & Filter Contacts
            </CardTitle>
            <CardDescription className="text-gray-600">
              Find contacts quickly by name, phone, or label
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, phone, or label..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 border-2 focus:border-blue-500"
                />
              </div>
              <Button variant="outline" className="flex items-center gap-2 h-12 border-2 hover:border-purple-500">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
              <Button variant="outline" className="flex items-center gap-2 h-12 border-2 hover:border-green-500">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Contacts Table */}
        <Card className="shadow-xl border-0 bg-white">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl text-gray-900">All Contacts</CardTitle>
                <CardDescription className="text-gray-600">
                  {filteredContacts.length} contact{filteredContacts.length !== 1 ? 's' : ''} found
                </CardDescription>
              </div>
              <Badge variant="outline" className="px-3 py-1">
                {contacts.length} Total
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {filteredContacts.length > 0 ? (
              <div className="rounded-lg border border-gray-200 overflow-hidden">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="font-semibold text-gray-900">Contact</TableHead>
                      <TableHead className="font-semibold text-gray-900">Phone</TableHead>
                      <TableHead className="font-semibold text-gray-900">Label</TableHead>
                      <TableHead className="font-semibold text-gray-900">Added</TableHead>
                      <TableHead className="font-semibold text-gray-900 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContacts.map((contact, index) => (
                      <TableRow key={contact.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-full">
                              <User className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{contact.name || 'Unnamed Contact'}</p>
                              <p className="text-sm text-gray-500">ID: {contact.id.slice(0, 8)}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span className="font-mono text-sm">{contact.raw_phone}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {contact.label ? (
                            <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 transition-colors">
                              {contact.label}
                            </Badge>
                          ) : (
                            <span className="text-gray-400 text-sm">No label</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-600">
                            {new Date(contact.added_at).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="hover:bg-blue-50 hover:text-blue-600 transition-colors"
                              title="Edit Contact"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="hover:bg-red-50 hover:text-red-600 transition-colors"
                              title="Delete Contact"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No contacts found</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm ? 'Try adjusting your search terms' : 'Start by adding your first contact'}
                </p>
                {!searchTerm && (
                  <Button 
                    onClick={() => setIsAddDialogOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Contact
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}