'use client'

import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Users, Contact, Send } from 'lucide-react'

export default function DashboardPage() {
  const { data: session } = useSession()
  const userRole = session?.user.role

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back, {session?.user.name}!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Templates</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              {userRole === 'ADMIN' ? 'Manage templates' : 'Available templates'}
            </p>
          </CardContent>
        </Card>

        {userRole === 'ADMIN' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Active users
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contacts</CardTitle>
            <Contact className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Your contacts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Prepared to send
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks you can perform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {userRole === 'ADMIN' && (
              <div className="space-y-2">
                <h4 className="font-medium">Admin Actions</h4>
                <div className="flex flex-wrap gap-2">
                  <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200">
                    Create User
                  </button>
                  <button className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm hover:bg-green-200">
                    Create Template
                  </button>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <h4 className="font-medium">User Actions</h4>
              <div className="flex flex-wrap gap-2">
                <button className="px-3 py-1 bg-purple-100 text-purple-700 rounded-md text-sm hover:bg-purple-200">
                  Add Contact
                </button>
                <button className="px-3 py-1 bg-orange-100 text-orange-700 rounded-md text-sm hover:bg-orange-200">
                  Prepare Message
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your recent actions on the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Welcome to WhatsX</p>
                  <p className="text-xs text-gray-500">Just now</p>
                </div>
              </div>
              <div className="text-center text-gray-500 py-8">
                <p className="text-sm">No recent activity</p>
                <p className="text-xs">Start using the platform to see your activity here</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}