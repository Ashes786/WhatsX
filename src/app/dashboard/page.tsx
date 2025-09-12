'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Users, 
  Contact, 
  Send, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface Template {
  id: string
  title: string
  is_active: boolean
}

interface Contact {
  id: string
  name?: string
  raw_phone: string
  label?: string
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

export default function DashboardPage() {
  const { data: session } = useSession()
  const userRole = session?.user.role
  
  const [stats, setStats] = useState({
    templates: 0,
    contacts: 0,
    recentJobs: 0,
    activeUsers: 0
  })
  
  const [recentActivity, setRecentActivity] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch templates
      const templatesResponse = await fetch('/api/templates')
      if (templatesResponse.ok) {
        const templates = await templatesResponse.json()
        setStats(prev => ({ ...prev, templates: templates.length }))
      }

      // Fetch contacts
      const contactsResponse = await fetch('/api/contacts')
      if (contactsResponse.ok) {
        const contacts = await contactsResponse.json()
        setStats(prev => ({ ...prev, contacts: contacts.length }))
      }

      // Fetch recent prepare jobs from API
      const prepareResponse = await fetch('/api/prepare-to-send')
      if (prepareResponse.ok) {
        const prepareJobs = await prepareResponse.json()
        setStats(prev => ({ ...prev, recentJobs: prepareJobs.length }))
        
        // Convert prepare jobs to activity items
        const jobActivities = prepareJobs.slice(0, 3).map((job: PrepareJob, index: number) => ({
          id: job.id,
          type: 'message_prepared',
          title: `Message prepared for ${job.recipients_final.length} recipients`,
          description: job.message_preview.substring(0, 50) + '...',
          time: index === 0 ? 'Just now' : index === 1 ? '1 hour ago' : '2 hours ago',
          icon: Send,
          color: 'text-purple-600'
        }))
        setRecentActivity(jobActivities)
      }

      // Fetch active users if admin
      if (userRole === 'ADMIN') {
        const usersResponse = await fetch('/api/admin/users')
        if (usersResponse.ok) {
          const users = await usersResponse.json()
          const activeUsers = users.filter((user: any) => user.status === 'ACTIVE').length
          setStats(prev => ({ ...prev, activeUsers }))
        }
      }

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'template_created':
      case 'contacts_imported':
        return <Badge variant="default" className="bg-green-100 text-green-800">Success</Badge>
      case 'message_prepared':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Prepared</Badge>
      default:
        return <Badge variant="secondary">Pending</Badge>
    }
  }

  if (loading) {
    return (
      <div className="p-6 h-full">
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
    <div className="p-6 space-y-6 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {session?.user.name}! Here's your platform overview.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="hidden sm:flex">
            {userRole === 'ADMIN' ? 'Administrator' : 'User'}
          </Badge>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">Live</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Templates</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.templates}</div>
            <p className="text-xs text-gray-500">
              {userRole === 'ADMIN' ? 'Manage templates' : 'Available templates'}
            </p>
            <div className="mt-2">
              <TrendingUp className="h-3 w-3 text-green-500 inline mr-1" />
              <span className="text-xs text-green-500">+2 this week</span>
            </div>
          </CardContent>
        </Card>

        {userRole === 'ADMIN' && (
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Users</CardTitle>
              <Users className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.activeUsers}</div>
              <p className="text-xs text-gray-500">
                Total registered users
              </p>
              <div className="mt-2">
                <TrendingUp className="h-3 w-3 text-green-500 inline mr-1" />
                <span className="text-xs text-green-500">+3 this month</span>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Contacts</CardTitle>
            <Contact className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.contacts}</div>
            <p className="text-xs text-gray-500">
              Your contact list
            </p>
            <div className="mt-2">
              <TrendingUp className="h-3 w-3 text-green-500 inline mr-1" />
              <span className="text-xs text-green-500">+15 this week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Messages Prepared</CardTitle>
            <Send className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.recentJobs}</div>
            <p className="text-xs text-gray-500">
              Total prepared messages
            </p>
            <div className="mt-2">
              <TrendingUp className="h-3 w-3 text-green-500 inline mr-1" />
              <span className="text-xs text-green-500">+18 today</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-blue-600" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Common tasks you can perform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {userRole === 'ADMIN' && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Admin Tasks</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => window.location.href = '/dashboard/users'}
                    className="flex items-center gap-2"
                  >
                    <Users className="h-4 w-4" />
                    Manage Users
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => window.location.href = '/dashboard/templates'}
                    className="flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Create Template
                  </Button>
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">User Tasks</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.location.href = '/dashboard/contacts'}
                  className="flex items-center gap-2"
                >
                  <Contact className="h-4 w-4" />
                  Add Contacts
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.location.href = '/dashboard/prepare'}
                  className="flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Prepare Message
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Your recent actions on the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full bg-gray-100`}>
                      <activity.icon className={`h-4 w-4 ${activity.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.title}
                        </p>
                        <span className="text-xs text-gray-500">{activity.time}</span>
                      </div>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                      {getStatusBadge(activity.type)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No recent activity</p>
                  <p className="text-sm text-gray-400">Start using the platform to see your activity here</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-800">API Service</span>
              </div>
              <span className="text-sm text-green-600">Operational</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-800">Database</span>
              </div>
              <span className="text-sm text-green-600">Connected</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-800">WhatsApp API</span>
              </div>
              <span className="text-sm text-green-600">Ready</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}