'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  UserPlus,
  Send,
  Settings,
  Bell,
  Search,
  Home,
  MessageSquare,
  BarChart3,
  Database,
  User,
  Cog
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DashboardLayoutProps {
  children: React.ReactNode
}

const menuItems = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
    description: 'Overview and analytics'
  },
  {
    title: 'Users',
    url: '/dashboard/users',
    icon: Users,
    adminOnly: true,
    description: 'Manage user accounts'
  },
  {
    title: 'Templates',
    url: '/dashboard/templates',
    icon: FileText,
    description: 'Manage message templates'
  },
  {
    title: 'Contacts',
    url: '/dashboard/contacts',
    icon: UserPlus,
    userOnly: true,
    description: 'Manage contacts'
  },
  {
    title: 'Prepare & Send',
    url: '/dashboard/prepare',
    icon: Send,
    userOnly: true,
    description: 'Create and send messages'
  },
  {
    title: 'Message History',
    url: '/messages',
    icon: MessageSquare,
    userOnly: true,
    description: 'Campaign history and analytics'
  },
]

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth < 768
      setIsMobile(isMobileDevice)
      if (isMobileDevice) {
        setIsCollapsed(true)
      } else {
        setIsCollapsed(false)
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    if (status === 'loading') return
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileMenuOpen(!isMobileMenuOpen)
    } else {
      setIsCollapsed(!isCollapsed)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const userRole = session.user.role
  const filteredMenuItems = menuItems.filter(item => {
    if (item.adminOnly && userRole !== 'ADMIN') return false
    if (item.userOnly && userRole !== 'USER') return false
    return true
  })

  const filteredSearchItems = filteredMenuItems.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <MessageSquare className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">WhatsX</span>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="p-2">
            <Bell className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="p-2">
                <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-white">
                    {session.user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Cog className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="p-2"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex fixed left-0 top-0 h-screen z-40">
        <div className={`bg-white shadow-xl border-r border-gray-200 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-80'} flex flex-col h-full`}>
          {/* Logo Section */}
          <div className="p-6 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                {!isCollapsed && (
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">WhatsX</h1>
                    <p className="text-xs text-gray-500">Messaging Platform</p>
                  </div>
                )}
              </div>
              {!isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleSidebar}
                  className="ml-2 p-2"
                >
                  {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </Button>
              )}
            </div>
          </div>

          {/* Search Section */}
          {!isCollapsed && (
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search menu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                {isCollapsed ? 'Menu' : 'Navigation'}
              </h3>
              {filteredSearchItems.map((item) => (
                <a
                  key={item.title}
                  href={item.url}
                  className={`flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-50 transition-colors duration-200 group ${
                    window.location.pathname === item.url ? 'bg-blue-100 border-l-4 border-blue-600' : ''
                  }`}
                >
                  <div className={`p-2 rounded-lg ${window.location.pathname === item.url ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 group-hover:bg-blue-600 group-hover:text-white'}`}>
                    <item.icon className="h-4 w-4" />
                  </div>
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 group-hover:text-blue-900">{item.title}</p>
                      <p className="text-xs text-gray-500 group-hover:text-blue-700">{item.description}</p>
                    </div>
                  )}
                </a>
              ))}
            </div>
          </div>

          {/* Logout Section - Fixed at Bottom */}
          <div className="p-4 border-t border-gray-200 flex-shrink-0">
            {!isCollapsed ? (
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => signOut()}
                  className="w-full justify-start"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => signOut()}
                  className="w-full justify-center p-2"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobile && isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      {isMobile && isMobileMenuOpen && (
        <div className="fixed inset-y-0 left-0 z-40 w-80 bg-white shadow-xl">
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <MessageSquare className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">WhatsX</h1>
                    <p className="text-xs text-gray-500">Messaging Platform</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Navigation</h3>
                {filteredMenuItems.map((item) => (
                  <a
                    key={item.title}
                    href={item.url}
                    className={`flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-50 transition-colors duration-200 ${
                      window.location.pathname === item.url ? 'bg-blue-100 border-l-4 border-blue-600' : ''
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${window.location.pathname === item.url ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{item.title}</p>
                      <p className="text-xs text-gray-500">{item.description}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 flex-shrink-0">
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => signOut()}
                  className="w-full justify-start"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`transition-all duration-300 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-80'} ${isMobile && isMobileMenuOpen ? 'lg:ml-80' : ''}`}>
        {/* Desktop Header */}
        <div className="hidden lg:block bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                  <p className="text-sm text-gray-600">Welcome back, {session.user.name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">Live</span>
                </div>
                <Button variant="ghost" size="sm" className="p-2">
                  <Bell className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2 p-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {session.user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <ChevronDown className="h-4 w-4 text-gray-600" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{session.user.name}</p>
                        <p className="text-xs text-gray-500">{session.user.email}</p>
                        <Badge variant={userRole === 'ADMIN' ? 'default' : 'secondary'} className="text-xs w-fit">
                          {userRole}
                        </Badge>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Cog className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut()}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Content Header */}
        <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome back, {session.user.name}</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Live</span>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  )
}
