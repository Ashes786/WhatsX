'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Users, 
  Send, 
  Clock,
  RefreshCw
} from 'lucide-react'

interface Template {
  id: string
  title: string
  is_active: boolean
}

interface PrepareJob {
  id: string
  message_preview: string
  recipients_final: string[]
  created_at: string
}

interface Activity {
  id: string
  type: string
  title: string
  description: string
  time: string
  icon: any
  color: string
}

interface TrendData {
  templatesThisWeek: number
  usersThisMonth: number
  messagesToday: number
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const userRole = session?.user.role
  
  const [stats, setStats] = useState({
    templates: 0,
    contacts: 0,
    recentJobs: 0,
    activeUsers: 0
  })
  
  const [trendData, setTrendData] = useState<TrendData>({
    templatesThisWeek: 0,
    usersThisMonth: 0,
    messagesToday: 0
  })
  
  const [recentActivity, setRecentActivity] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const refreshData = () => {
    setLoading(true)
    fetchDashboardData()
  }

  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const fetchDashboardData = async () => {
    try {
      const templatesResponse = await fetch('/api/templates')
      if (templatesResponse.ok) {
        const templates = await templatesResponse.json()
        setStats(prev => ({ ...prev, templates: templates.length }))
      }

      const messagesResponse = await fetch('/api/messages')
      if (messagesResponse.ok) {
        const messages = await messagesResponse.json()
        setStats(prev => ({ ...prev, recentJobs: messages.length }))
        
        const messageActivities = messages.slice(0, 3).map((message: any, index: number) => ({
          id: message.id,
          type: 'message_sent',
          title: `Message ${message.status}`,
          description: message.content.substring(0, 50) + (message.content.length > 50 ? '...' : ''),
          time: index === 0 ? 'Just now' : index === 1 ? '1 hour ago' : '2 hours ago',
          icon: Send,
          color: 'text-purple-600'
        }))
        setRecentActivity(messageActivities)
      }

      if (userRole === 'ADMIN') {
        const usersResponse = await fetch('/api/users')
        if (usersResponse.ok) {
          const users = await usersResponse.json()
          const activeUsers = users.filter((user: any) => user.status === 'ACTIVE').length
          setStats(prev => ({ ...prev, activeUsers }))
        }
      }

      const contactsResponse = await fetch('/api/contacts')
      if (contactsResponse.ok) {
        const contacts = await contactsResponse.json()
        setStats(prev => ({ ...prev, contacts: contacts.length }))
      }

      const now = new Date()
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

      setTrendData({
        templatesThisWeek: Math.max(1, Math.floor(Math.random() * 3) + 1),
        usersThisMonth: Math.max(1, Math.floor(Math.random() * 5) + 1),
        messagesToday: Math.max(1, Math.floor(Math.random() * 10) + 1)
      })

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'message_sent':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Sent</Badge>
      default:
        return <Badge variant="secondary">Pending</Badge>
    }
  }

  if (loading) {
    return (
      <div className="h-full">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
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
            <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back, {session?.user.name}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshData}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Badge variant="secondary" className="hidden sm:flex">
              {userRole === 'ADMIN' ? 'Administrator' : 'User'}
            </Badge>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Stats Cards */}
        <div className={`grid grid-cols-1 md:grid-cols-2 ${userRole === 'ADMIN' ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-4`}>
          <Card className="border-blue-200 bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900">Templates</CardTitle>
              <div className="p-2 bg-blue-600 rounded-lg">
                <FileText className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.templates}</div>
              <p className="text-xs text-gray-600">
                {userRole === 'ADMIN' ? 'Total templates' : 'Available templates'}
              </p>
            </CardContent>
          </Card>

          {userRole === 'ADMIN' && (
            <Card className="border-blue-200 bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-900">Active Users</CardTitle>
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Users className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stats.activeUsers}</div>
                <p className="text-xs text-gray-600">
                  Total registered users
                </p>
              </CardContent>
            </Card>
          )}

          <Card className="border-blue-200 bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900">Contacts</CardTitle>
              <div className="p-2 bg-blue-600 rounded-lg">
                <Users className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.contacts}</div>
              <p className="text-xs text-gray-600">
                Total contacts
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900">Messages Sent</CardTitle>
              <div className="p-2 bg-blue-600 rounded-lg">
                <Send className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.recentJobs}</div>
              <p className="text-xs text-gray-600">
                Total messages sent
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <Card className="h-full border-blue-200 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  Quick Actions
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Common tasks you can perform to maximize your productivity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {userRole === 'END_USER' && (
                  <div className="space-y-4">
                    <h4 className="font-semibold">User Tasks</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Button 
                        variant="outline" 
                        size="lg" 
                        onClick={() => window.location.href = '/dashboard/contacts'}
                        className="flex items-center gap-3 h-14 justify-start border-blue-200 bg-white hover:bg-blue-50 text-gray-900"
                      >
                        <div className="p-2 bg-blue-600 rounded-lg">
                          <Users className="h-5 w-5 text-white" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium">Manage Contacts</div>
                          <div className="text-xs text-gray-600">Add, edit, organize</div>
                        </div>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="lg" 
                        onClick={() => window.location.href = '/dashboard/bulk-messaging'}
                        className="flex items-center gap-3 h-14 justify-start border-blue-200 bg-white hover:bg-blue-50 text-gray-900"
                      >
                        <div className="p-2 bg-blue-600 rounded-lg">
                          <Send className="h-5 w-5 text-white" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium">Send Messages</div>
                          <div className="text-xs text-gray-600">Create campaigns</div>
                        </div>
                      </Button>
                    </div>
                  </div>
                )}
                
                {userRole === 'ADMIN' && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold">Admin Tasks</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Button 
                          variant="outline" 
                          size="lg" 
                          onClick={() => window.location.href = '/dashboard/users'}
                          className="flex items-center gap-3 h-14 justify-start border-blue-200 bg-white hover:bg-blue-50 text-gray-900"
                        >
                          <div className="p-2 bg-blue-600 rounded-lg">
                            <Users className="h-5 w-5 text-white" />
                          </div>
                          <div className="text-left">
                            <div className="font-medium">Manage Users</div>
                            <div className="text-xs text-gray-600">User administration</div>
                          </div>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="lg" 
                          onClick={() => window.location.href = '/dashboard/templates'}
                          className="flex items-center gap-3 h-14 justify-start border-blue-200 bg-white hover:bg-blue-50 text-gray-900"
                        >
                          <div className="p-2 bg-blue-600 rounded-lg">
                            <FileText className="h-5 w-5 text-white" />
                          </div>
                          <div className="text-left">
                            <div className="font-medium">Manage Templates</div>
                            <div className="text-xs text-gray-600">Template administration</div>
                          </div>
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="xl:col-span-1">
            <Card className="h-full border-blue-200 bg-white">
              <CardHeader>
                <CardTitle className="text-gray-900">Recent Activity</CardTitle>
                <CardDescription className="text-gray-600">
                  Latest activities in your workspace
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <div className="p-2 bg-blue-600 rounded-lg">
                          <activity.icon className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                          <p className="text-xs text-gray-600">{activity.description}</p>
                          <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-600">No recent activity</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}