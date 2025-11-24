'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  MessageSquare, 
  Clock,
  CheckCircle,
  AlertCircle,
  Filter,
  Download,
  Calendar
} from 'lucide-react'

interface DeliveryLog {
  id: string
  status: string
  responseDetail: string | null
  timestamp: string
  message: {
    id: string
    content: string
    createdAt: string
    user: {
      name: string
      email: string
    }
  }
  contact: {
    name: string
    phoneNumber: string
  }
}

interface User {
  id: string
  name: string
  email: string
}

export default function MessageLogsPage() {
  const { data: session } = useSession()
  const userRole = session?.user?.role
  const [logs, setLogs] = useState<DeliveryLog[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    userId: '',
    startDate: '',
    endDate: ''
  })

  useEffect(() => {
    fetchLogs()
    if (userRole === 'ADMIN') {
      fetchUsers()
    }
  }, [userRole])

  const fetchLogs = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.userId) params.append('userId', filters.userId)
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)

      const response = await fetch(`/api/logs?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setLogs(data)
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const applyFilters = () => {
    setLoading(true)
    fetchLogs()
  }

  const clearFilters = () => {
    setFilters({ userId: '', startDate: '', endDate: '' })
    setLoading(true)
    setTimeout(fetchLogs, 100)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SENT':
        return <Badge className="bg-blue-100 text-blue-800">Sent</Badge>
      case 'DELIVERED':
        return <Badge className="bg-green-100 text-green-800">Delivered</Badge>
      case 'FAILED':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'Message', 'Contact', 'Phone Number', 'Status', 'Response Detail'].join(','),
      ...logs.map(log => [
        new Date(log.timestamp).toLocaleString(),
        `"${log.message.content.replace(/"/g, '""')}"`,
        `"${log.contact.name}"`,
        log.contact.phoneNumber,
        log.status,
        `"${log.responseDetail || ''}"`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `message-logs-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
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
          <h1 className="text-3xl font-bold text-gray-900">Message Logs</h1>
          <p className="text-gray-600 mt-2">
            {userRole === 'ADMIN' ? 'View all message logs and filter by user' : 'View your message delivery logs'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">Live</span>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-blue-200 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-900">
            <div className="p-2 bg-blue-600 rounded-lg mr-2">
              <Filter className="h-5 w-5 text-white" />
            </div>
            Filters
          </CardTitle>
          <CardDescription className="text-gray-600">
            Filter logs by date and {userRole === 'ADMIN' ? 'user' : 'time range'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {userRole === 'ADMIN' && (
              <div>
                <Label htmlFor="user">User</Label>
                <Select value={filters.userId} onValueChange={(value) => handleFilterChange('userId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All users" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All users</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="datetime-local"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>
            
            <div className="flex items-end space-x-2">
              <Button onClick={applyFilters} className="bg-blue-600 hover:bg-blue-700">
                <Filter className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
              <Button variant="outline" onClick={clearFilters} className="border-blue-200 text-blue-700 hover:bg-blue-50">
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card className="border-blue-200 bg-white">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center text-gray-900">
                <div className="p-2 bg-blue-600 rounded-lg mr-2">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
                Delivery Logs
              </CardTitle>
              <CardDescription className="text-gray-600">
                {logs.length} log{logs.length !== 1 ? 's' : ''} found
              </CardDescription>
            </div>
            <Button variant="outline" onClick={exportLogs} className="border-blue-200 text-gray-900 hover:bg-blue-50">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {logs.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Phone Number</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Response Detail</TableHead>
                    {userRole === 'ADMIN' && <TableHead>Sent By</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate" title={log.message.content}>
                          {log.message.content}
                        </div>
                      </TableCell>
                      <TableCell>{log.contact.name}</TableCell>
                      <TableCell>{log.contact.phoneNumber}</TableCell>
                      <TableCell>{getStatusBadge(log.status)}</TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate text-sm text-gray-600" title={log.responseDetail || ''}>
                          {log.responseDetail || '-'}
                        </div>
                      </TableCell>
                      {userRole === 'ADMIN' && (
                        <TableCell>
                          <div className="text-sm">
                            <div>{log.message.user.name}</div>
                            <div className="text-gray-500">{log.message.user.email}</div>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No logs found</p>
              <p className="text-sm text-gray-400">
                {filters.userId || filters.startDate || filters.endDate 
                  ? 'Try adjusting your filters' 
                  : 'Send some messages to see logs here'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}