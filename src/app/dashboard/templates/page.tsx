'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2,
  ToggleLeft,
  ToggleRight,
  Eye,
  Copy,
  Check
} from 'lucide-react'

interface Template {
  id: string
  title: string
  content: string
  is_active: boolean
  created_at: string
  creator_name?: string
}

export default function TemplatesPage() {
  const { data: session } = useSession()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [newTemplate, setNewTemplate] = useState({
    title: '',
    content: '',
    is_active: true
  })

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/admin/templates')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data)
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddTemplate = async () => {
    try {
      const response = await fetch('/api/admin/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTemplate),
      })

      if (response.ok) {
        await fetchTemplates()
        setNewTemplate({ title: '', content: '', is_active: true })
        setIsAddDialogOpen(false)
      } else {
        const error = await response.json()
        alert(`Failed to add template: ${error.error}`)
      }
    } catch (error) {
      console.error('Failed to add template:', error)
      alert('Failed to add template. Please try again.')
    }
  }

  const handleEditTemplate = async () => {
    if (!selectedTemplate) return

    try {
      const response = await fetch(`/api/admin/templates/${selectedTemplate.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: selectedTemplate.title,
          content: selectedTemplate.content,
          is_active: selectedTemplate.is_active
        }),
      })

      if (response.ok) {
        await fetchTemplates()
        setIsEditDialogOpen(false)
        setSelectedTemplate(null)
      } else {
        const error = await response.json()
        alert(`Failed to update template: ${error.error}`)
      }
    } catch (error) {
      console.error('Failed to update template:', error)
      alert('Failed to update template. Please try again.')
    }
  }

  const handleToggleTemplateStatus = async (templateId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/templates/${templateId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: !currentStatus }),
      })

      if (response.ok) {
        await fetchTemplates()
      } else {
        const error = await response.json()
        alert(`Failed to update template status: ${error.error}`)
      }
    } catch (error) {
      console.error('Failed to toggle template status:', error)
      alert('Failed to update template status. Please try again.')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Template content copied to clipboard!')
  }

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-100 text-green-800">Active</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">Inactive</Badge>
    )
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Template Management</h1>
          <p className="text-gray-600 mt-2">
            Create and manage message templates for users
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Template</DialogTitle>
              <DialogDescription>
                Create a new message template that users can use for their campaigns
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Template Title *</Label>
                <Input
                  id="title"
                  value={newTemplate.title}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Welcome Message"
                />
              </div>
              <div>
                <Label htmlFor="content">Template Content *</Label>
                <Textarea
                  id="content"
                  value={newTemplate.content}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, content: e.target.value }))}
                  rows={6}
                  placeholder="Hello {{name}}, welcome to our service!..."
                />
                <p className="text-sm text-gray-500 mt-1">
                  Use {{name}}, {{phone}}, or other variables for personalization
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={newTemplate.is_active}
                  onCheckedChange={(checked) => setNewTemplate(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active">Make template immediately available</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddTemplate}>
                  Create Template
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{templates.length}</p>
                <p className="text-sm text-gray-600">Total Templates</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-full">
                <ToggleRight className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{templates.filter(t => t.is_active).length}</p>
                <p className="text-sm text-gray-600">Active Templates</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <ToggleLeft className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{templates.filter(t => !t.is_active).length}</p>
                <p className="text-sm text-gray-600">Inactive Templates</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Templates Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Templates</CardTitle>
          <CardDescription>
            {templates.length} template{templates.length !== 1 ? 's' : ''} available
          </CardDescription>
        </CardHeader>
        <CardContent>
          {templates.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Template</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Content Preview</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gray-100 rounded-full">
                          <FileText className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium">{template.title}</p>
                          <p className="text-sm text-gray-500">ID: {template.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(template.is_active)}</TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="text-sm text-gray-600 truncate">
                          {template.content.substring(0, 60)}...
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(template.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(template.content)}
                          title="Copy Content"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedTemplate(template)
                            setIsEditDialogOpen(true)
                          }}
                          title="Edit Template"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleTemplateStatus(template.id, template.is_active)}
                          title={template.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {template.is_active ? (
                            <ToggleLeft className="h-4 w-4 text-red-600" />
                          ) : (
                            <ToggleRight className="h-4 w-4 text-green-600" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No templates found</p>
              <p className="text-sm text-gray-400">Create your first template to get started</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Template Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
            <DialogDescription>
              Update template details and content
            </DialogDescription>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Template Title *</Label>
                <Input
                  id="edit-title"
                  value={selectedTemplate.title}
                  onChange={(e) => setSelectedTemplate(prev => 
                    prev ? { ...prev, title: e.target.value } : null
                  )}
                />
              </div>
              <div>
                <Label htmlFor="edit-content">Template Content *</Label>
                <Textarea
                  id="edit-content"
                  value={selectedTemplate.content}
                  onChange={(e) => setSelectedTemplate(prev => 
                    prev ? { ...prev, content: e.target.value } : null
                  )}
                  rows={6}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Use {{name}}, {{phone}}, or other variables for personalization
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-is_active"
                  checked={selectedTemplate.is_active}
                  onCheckedChange={(checked) => setSelectedTemplate(prev => 
                    prev ? { ...prev, is_active: checked } : null
                  )}
                />
                <Label htmlFor="edit-is_active">Template is active and available</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleEditTemplate}>
                  Update Template
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}