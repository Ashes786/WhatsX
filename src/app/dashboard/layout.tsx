'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, SidebarProvider } from '@/components/ui/sidebar'
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  LogOut,
  Menu,
  X,
  Contact,
  MessageSquare,
  Send
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
    title: 'Messages',
    url: '/dashboard/messages',
    icon: MessageSquare,
    userOnly: true,
  },
  {
    title: 'Campaigns',
    url: '/dashboard/prepare',
    icon: Send,
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth < 768
      setIsMobile(isMobileDevice)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    
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

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileMenuOpen(!isMobileMenuOpen)
    }
  }

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
      <div className="min-h-screen bg-gray-50 flex">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between absolute top-0 left-0 right-0 z-30">
          <div className="flex items-center space-x-3">
            <FileText className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">WhatsX</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden lg:flex h-screen">
          <Sidebar 
            collapsible={!isMobile} 
            className="transition-all duration-300 bg-white border-r border-gray-200"
          >
            <SidebarHeader className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-2 min-w-0">
                <FileText className="h-6 w-6 text-blue-600 flex-shrink-0" />
                <span className="text-lg font-semibold text-gray-900 truncate">WhatsX</span>
              </div>
            </SidebarHeader>
            <SidebarContent className="p-0">
              <SidebarGroup>
                <SidebarGroupLabel className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Navigation
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu className="p-0">
                    {filteredMenuItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild className="w-full">
                          <a 
                            href={item.url} 
                            className="flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors duration-200"
                          >
                            <item.icon className="h-4 w-4 text-gray-600 flex-shrink-0" />
                            <span className="text-gray-700">{item.title}</span>
                          </a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="p-4 border-t border-gray-200">
              <div className="space-y-3">
                <div className="text-xs text-gray-500">
                  <div className="text-sm font-medium text-gray-700 mb-1">Logged in as:</div>
                  <div className="text-gray-600">{session?.user?.name || 'Loading...'}</div>
                  <div className="text-gray-500 mt-1">Role: {session?.user?.role || 'Loading...'}</div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => signOut()}
                  className="w-full justify-start"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="ml-2">Logout</span>
                </Button>
              </div>
            </SidebarFooter>
          </Sidebar>
        </div>

        {/* Mobile Overlay */}
        {isMobile && isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Mobile Sidebar */}
        {isMobile && isMobileMenuOpen && (
          <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 shadow-lg">
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-6 w-6 text-blue-600" />
                    <span className="text-lg font-semibold text-gray-900">WhatsX</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <SidebarGroup>
                  <SidebarGroupLabel className="px-0 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Navigation
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu className="p-0">
                      {filteredMenuItems.map((item) => (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton asChild className="w-full">
                            <a 
                              href={item.url} 
                              className="flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors duration-200"
                            >
                              <item.icon className="h-4 w-4 text-gray-600" />
                              <span className="text-gray-700">{item.title}</span>
                            </a>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </div>
              <div className="p-4 border-t border-gray-200">
                <div className="space-y-3">
                  <div className="text-xs text-gray-500">
                    <div className="text-sm font-medium text-gray-700 mb-1">Logged in as:</div>
                    <div className="text-gray-600">{session?.user?.name || 'Loading...'}</div>
                    <div className="text-gray-500 mt-1">Role: {session?.user?.role || 'Loading...'}</div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => signOut()}
                    className="w-full justify-start"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="ml-2">Logout</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className={`flex-1 transition-all duration-300 ${isMobile && isMobileMenuOpen ? 'lg:ml-64' : ''}`}>
          <div className="h-screen flex flex-col">
            {/* Desktop Header */}
            <div className="hidden lg:block bg-white border-b border-gray-200 px-4 py-2">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Dashboard</h1>
                  <p className="text-xs text-gray-600 mt-1">Welcome back, {session?.user?.name || 'Loading...'}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-gray-600">Live</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-700">
                        {session?.user?.name?.charAt(0).toUpperCase() || '?'}
                      </span>
                    </div>
                    <div className="hidden sm:block">
                      <div className="text-xs font-medium text-gray-900">{session?.user?.name || 'Loading...'}</div>
                      <div className="text-xs text-gray-500">{session?.user?.role || 'Loading...'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Content */}
            <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-2 mt-16">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-base font-bold text-gray-900">Dashboard</h1>
                  <p className="text-xs text-gray-600">Welcome back, {session?.user?.name || 'Loading...'}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-600">Live</span>
                </div>
              </div>
            </div>

            {/* Page Content */}
            <main className="flex-1 overflow-y-auto bg-gray-50">
              {children}
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
}