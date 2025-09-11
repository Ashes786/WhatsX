'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, MessageSquare, FileText, Phone, Settings, LogOut } from 'lucide-react'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!session) {
    return null
  }

  const dashboardCards = [
    {
      title: 'Templates',
      description: 'Manage message templates for quick messaging',
      icon: FileText,
      onClick: () => router.push('/dashboard/templates'),
      color: 'bg-blue-500',
    },
    {
      title: 'Contacts',
      description: 'Manage your contact list with duplicate detection',
      icon: Phone,
      onClick: () => router.push('/dashboard/contacts'),
      color: 'bg-green-500',
    },
    {
      title: 'Messages',
      description: 'Compose and send messages using templates',
      icon: MessageSquare,
      onClick: () => router.push('/dashboard/messages'),
      color: 'bg-purple-500',
    },
  ]

  if (session.user?.role === 'ADMIN') {
    dashboardCards.push({
      title: 'User Management',
      description: 'Manage end users (Admin only)',
      icon: Users,
      onClick: () => router.push('/dashboard/users'),
      color: 'bg-red-500',
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="responsive-nav bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center responsive-nav">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className={`w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-lg flex items-center justify-center`}>
                  <MessageSquare className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
                </div>
                <h1 className="responsive-text-lg sm:responsive-text-xl lg:responsive-text-2xl font-bold text-gray-900">WhatsX Dashboard</h1>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="hidden sm:block text-right">
                <p className="responsive-text-sm font-medium text-gray-900">{session.user?.name}</p>
                <p className="responsive-text-xs text-gray-500">{session.user?.email}</p>
              </div>
              <Badge variant={session.user?.role === 'ADMIN' ? 'destructive' : 'secondary'} className="responsive-text-xs">
                {session.user?.role}
              </Badge>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push('/api/auth/signout')}
                className="hidden sm:flex items-center space-x-1 sm:space-x-2"
              >
                <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="responsive-text-xs">Logout</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push('/api/auth/signout')}
                className="sm:hidden"
              >
                <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="sm:hidden bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
              <h1 className="responsive-text-base sm:responsive-text-lg font-bold text-gray-900">Dashboard</h1>
            </div>
            <Badge variant={session.user?.role === 'ADMIN' ? 'destructive' : 'secondary'} className="responsive-text-xs">
              {session.user?.role}
            </Badge>
          </div>
          <div className="pb-3">
            <p className="responsive-text-sm font-medium text-gray-900">{session.user?.name}</p>
            <p className="responsive-text-xs text-gray-500">{session.user?.email}</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-4 sm:py-6 lg:py-8">
        <div className="px-4 sm:px-6 lg:px-8">
          {/* Welcome Section */}
          <div className="mb-6 sm:mb-8">
            <h2 className="responsive-text-xl sm:responsive-text-2xl lg:responsive-text-3xl font-bold text-gray-900 mb-2 sm:mb-3">
              Welcome back, {session.user?.name}!
            </h2>
            <p className="responsive-text-base sm:responsive-text-lg text-gray-600">
              Manage your WhatsApp messaging automation from one central dashboard.
            </p>
          </div>

          {/* Dashboard Cards */}
          <div className="responsive-grid mb-6 sm:mb-8">
            {dashboardCards.map((card, index) => (
              <Card 
                key={index} 
                className="responsive-card group hover:shadow-lg transition-all cursor-pointer border border-gray-200 hover:border-gray-300"
                onClick={card.onClick}
              >
                <CardHeader className="responsive-card-header pb-2 sm:pb-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 ${card.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <card.icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Settings className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                    </div>
                  </div>
                  <CardTitle className="responsive-text-base sm:responsive-text-lg lg:responsive-text-xl">{card.title}</CardTitle>
                </CardHeader>
                <CardContent className="responsive-card-content pt-0">
                  <CardDescription className="responsive-text-sm sm:responsive-text-base">
                    {card.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <Card className="responsive-card-compact border border-gray-200">
              <CardContent className="responsive-card-compact-content p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="responsive-text-xs sm:responsive-text-sm font-medium text-gray-600">Total Templates</p>
                    <p className="responsive-text-lg sm:responsive-text-xl lg:responsive-text-2xl font-bold text-gray-900">12</p>
                  </div>
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="responsive-card-compact border border-gray-200">
              <CardContent className="responsive-card-compact-content p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="responsive-text-xs sm:responsive-text-sm font-medium text-gray-600">Total Contacts</p>
                    <p className="responsive-text-lg sm:responsive-text-xl lg:responsive-text-2xl font-bold text-gray-900">48</p>
                  </div>
                  <Phone className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="responsive-card-compact border border-gray-200">
              <CardContent className="responsive-card-compact-content p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="responsive-text-xs sm:responsive-text-sm font-medium text-gray-600">Messages Sent</p>
                    <p className="responsive-text-lg sm:responsive-text-xl lg:responsive-text-2xl font-bold text-gray-900">156</p>
                  </div>
                  <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            
            {session.user?.role === 'ADMIN' && (
              <Card className="responsive-card-compact border border-gray-200">
                <CardContent className="responsive-card-compact-content p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="responsive-text-xs sm:responsive-text-sm font-medium text-gray-600">Active Users</p>
                      <p className="responsive-text-lg sm:responsive-text-xl lg:responsive-text-2xl font-bold text-gray-900">8</p>
                    </div>
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Recent Activity */}
          <Card className="responsive-card border border-gray-200">
            <CardHeader className="responsive-card-header">
              <CardTitle className="responsive-text-base sm:responsive-text-lg lg:responsive-text-xl">Recent Activity</CardTitle>
              <CardDescription className="responsive-text-sm sm:responsive-text-base">Your latest actions and system updates</CardDescription>
            </CardHeader>
            <CardContent className="responsive-card-content">
              <div className="mobile-spacing tablet-spacing desktop-spacing">
                <div className="flex items-center space-x-2 sm:space-x-4 p-2 sm:p-3 bg-gray-50 rounded-lg">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="responsive-text-sm sm:responsive-text-base font-medium">Welcome message template created</p>
                    <p className="responsive-text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 sm:space-x-4 p-2 sm:p-3 bg-gray-50 rounded-lg">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="responsive-text-sm sm:responsive-text-base font-medium">5 new contacts added</p>
                    <p className="responsive-text-xs text-gray-500">1 day ago</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 sm:space-x-4 p-2 sm:p-3 bg-gray-50 rounded-lg">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="responsive-text-sm sm:responsive-text-base font-medium">Message sent to 3 recipients</p>
                    <p className="responsive-text-xs text-gray-500">2 days ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}