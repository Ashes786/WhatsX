'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar'
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  LogOut,
  Menu,
  X,
  Contact,
  MessageSquare,
  Send,
  Target,
  PanelLeft
} from 'lucide-react'

interface DashboardLayoutProps {
  children: React.ReactNode
}

const menuItems = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Contacts',
    url: '/dashboard/contacts',
    icon: Contact,
    userOnly: true,
  },
  {
    title: 'Bulk Messaging',
    url: '/dashboard/bulk-messaging',
    icon: Send,
    userOnly: true,
  },
  {
    title: 'Message Logs',
    url: '/dashboard/message-logs',
    icon: MessageSquare,
    userOnly: true,
  },
  {
    title: 'Users',
    url: '/dashboard/users',
    icon: Users,
    adminOnly: true,
  },
  {
    title: 'Templates',
    url: '/dashboard/templates',
    icon: FileText,
    adminOnly: true,
  },
]

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') {
      console.log('User is unauthenticated, redirecting to signin')
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    console.log('Session status:', status)
    console.log('Session data:', session)
  }, [session, status])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Allow rendering even if session is null initially
  // The session will be validated on the server side for API calls
  const userRole = session?.user?.role || 'END_USER' // Default to END_USER for safety
  const filteredMenuItems = menuItems.filter(item => {
    // Show items without restrictions
    if (!item.adminOnly && !item.userOnly) return true
    
    // Show admin-only items to admins
    if (item.adminOnly && userRole === 'ADMIN') return true
    
    // Show user-only items to end users
    if (item.userOnly && userRole === 'END_USER') return true
    
    // Hide restricted items
    return false
  })

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar collapsible="icon" variant="sidebar" className="border-r border-gray-200 bg-white">
          <SidebarHeader className="border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-6 w-6 text-blue-600 flex-shrink-0" />
                <span className="text-lg font-semibold text-gray-900 group-data-[collapsible=icon]:hidden">WhatsX</span>
              </div>
              <SidebarTrigger className="h-7 w-7 group-data-[collapsible=icon]:absolute group-data-[collapsible=icon]:top-4 group-data-[collapsible=icon]:right-4" />
            </div>
          </SidebarHeader>
          <SidebarContent className="bg-white">
            <SidebarGroup>
              <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {filteredMenuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild tooltip={item.title}>
                        <a href={item.url}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="border-t border-gray-200 bg-white">
            <div className="p-4 space-y-3">
              <div className="text-xs text-gray-500 group-data-[collapsible=icon]:hidden">
                <div className="text-sm font-medium text-gray-700 mb-1">Logged in as:</div>
                <div className="text-gray-600">{session?.user?.name || 'Loading...'}</div>
                <div className="text-gray-500 mt-1">Role: {session?.user?.role || 'Loading...'}</div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => signOut()}
                className="w-full justify-start group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:p-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="ml-2 group-data-[collapsible=icon]:hidden">Logout</span>
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>
        
        <SidebarInset>
          <div className="flex flex-col h-full">
            {/* Header */}
            <header className="border-b border-gray-200 bg-white px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
                  <p className="text-sm text-gray-600 mt-1">Welcome back, {session?.user?.name || 'Loading...'}</p>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-600">Live</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {session?.user?.name?.charAt(0).toUpperCase() || '?'}
                      </span>
                    </div>
                    <div className="hidden sm:block">
                      <div className="text-sm font-medium text-gray-900">{session?.user?.name || 'Loading...'}</div>
                      <div className="text-xs text-gray-500">{session?.user?.role || 'Loading...'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
              {children}
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}