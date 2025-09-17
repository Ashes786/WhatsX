'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Search, Filter, Download, Eye, BarChart3, Users, CheckCircle, XCircle, Clock, Send } from 'lucide-react'

interface Campaign {
  id: string
  message_preview: string
  recipients_count: number
  delivered_count: number
  failed_count: number
  pending_count: number
  created_at: string
  sent_at?: string
  status: 'DRAFT' | 'PENDING' | 'SENT' | 'FAILED' | 'PARTIAL'
  template_title?: string
}

export default function MessagesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    if (status === 'loading') return
    
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    // Check if user is not ADMIN (this page is for users only)
    if (session?.user.role === 'ADMIN') {
      router.push('/dashboard')
      return
    }

    fetchCampaigns()
  }, [session, status, router])

  const fetchCampaigns = async () => {
    try {
      const response = await fetch('/api/prepare-to-send')
      if (response.ok) {
        const data = await response.json()
        // Transform the data to match campaign structure
        const transformedCampaigns = data.map((item: any) => ({
          id: item.id,
          message_preview: item.message_preview,
          recipients_count: item.recipients_final?.length || 0,
          delivered_count: Math.floor(Math.random() * item.recipients_final?.length || 0), // Mock data for now
          failed_count: Math.floor(Math.random() * (item.recipients_final?.length || 0) * 0.1), // Mock data
          pending_count: item.recipients_final?.length || 0,
          created_at: item.created_at,
          sent_at: item.sent_at,
          status: item.status || 'DRAFT',
          template_title: item.template_title
        }))
        setCampaigns(transformedCampaigns)
      }
    } catch (error) {
      console.error('Failed to fetch campaigns:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.message_preview.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (campaign.template_title && campaign.template_title.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter
    return matchesSearch && matchesStatus
  }).sort((a, b) => {
    const aValue = a[sortBy as keyof Campaign]
    const bValue = b[sortBy as keyof Campaign]
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
      'DRAFT': 'secondary',
      'SENT': 'default',
      'FAILED': 'destructive',
      'PENDING': 'outline',
      'PARTIAL': 'outline'
    }
    
    const icons: { [key: string]: React.ReactNode } = {
      'DRAFT': <Clock className="h-3 w-3" />,
      'SENT': <CheckCircle className="h-3 w-3" />,
      'FAILED': <XCircle className="h-3 w-3" />,
      'PENDING': <Clock className="h-3 w-3" />,
      'PARTIAL': <Clock className="h-3 w-3" />
    }
    
    return (
      <Badge variant={variants[status] || 'secondary'} className="flex items-center gap-1">
        {icons[status]}
        {status}
      </Badge>
    )
  }

  const getDeliveryRate = (delivered: number, total: number) => {
    if (total === 0) return 0
    return Math.round((delivered / total) * 100)
  }

  const exportCampaignData = (campaign: Campaign) => {
    const csvContent = [
      ['Campaign ID', 'Message Preview', 'Total Recipients', 'Delivered', 'Failed', 'Pending', 'Status', 'Created Date'],
      [campaign.id, campaign.message_preview, campaign.recipients_count.toString(), campaign.delivered_count.toString(), campaign.failed_count.toString(), campaign.pending_count.toString(), campaign.status, new Date(campaign.created_at).toLocaleDateString()]
    ].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `campaign-${campaign.id}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading campaign history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-xl font-bold text-gray-900">Campaign History</h1>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => router.push('/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Campaign History</h1>
              <p className="text-sm text-gray-600 mt-1">Track your message campaigns and delivery performance</p>
            </div>
          </div>
          <Button onClick={() => router.push('/dashboard/prepare')} size="lg">
            <Send className="h-4 w-4 mr-2" />
            New Campaign
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <main className="h-full overflow-y-auto bg-gray-50">
        <div className="p-4 lg:p-8 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="h-32 border-l-4 border-l-blue-500 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Campaigns</CardTitle>
                <BarChart3 className="h-5 w-5 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{campaigns.length}</div>
                <p className="text-xs text-gray-500 mt-1">All time campaigns</p>
              </CardContent>
            </Card>

            <Card className="h-32 border-l-4 border-l-green-500 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Sent</CardTitle>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {campaigns.reduce((sum, campaign) => sum + campaign.delivered_count, 0)}
                </div>
                <p className="text-xs text-gray-500 mt-1">Successfully delivered</p>
              </CardContent>
            </Card>

            <Card className="h-32 border-l-4 border-l-red-500 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Failed</CardTitle>
                <XCircle className="h-5 w-5 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {campaigns.reduce((sum, campaign) => sum + campaign.failed_count, 0)}
                </div>
                <p className="text-xs text-gray-500 mt-1">Failed deliveries</p>
              </CardContent>
            </Card>

            <Card className="h-32 border-l-4 border-l-orange-500 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Avg. Delivery Rate</CardTitle>
                <Users className="h-5 w-5 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {campaigns.length > 0 
                    ? Math.round(campaigns.reduce((sum, campaign) => sum + getDeliveryRate(campaign.delivered_count, campaign.recipients_count), 0) / campaigns.length)
                    : 0}%
                </div>
                <p className="text-xs text-gray-500 mt-1">Average success rate</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="h-5 w-5 mr-2 text-blue-600" />
                Filters & Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search campaigns..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="SENT">Sent</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                    <SelectItem value="PARTIAL">Partial</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created_at">Created Date</SelectItem>
                    <SelectItem value="sent_at">Sent Date</SelectItem>
                    <SelectItem value="recipients_count">Recipients</SelectItem>
                    <SelectItem value="delivered_count">Delivered</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as 'asc' | 'desc')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Newest First</SelectItem>
                    <SelectItem value="asc">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Campaigns Table */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-6 w-6 mr-3 text-blue-600" />
                Campaign History
              </CardTitle>
              <CardDescription>
                View detailed information about your message campaigns and delivery performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Message Preview</TableHead>
                      <TableHead>Template</TableHead>
                      <TableHead>Recipients</TableHead>
                      <TableHead>Delivery Stats</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCampaigns.map((campaign) => (
                      <TableRow key={campaign.id}>
                        <TableCell>
                          <div className="max-w-xs">
                            <p className="text-sm font-medium truncate">{campaign.message_preview}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">{campaign.template_title || 'Custom'}</span>
                        </TableCell>
                        <TableCell>
                          <div className="text-center">
                            <div className="text-lg font-semibold">{campaign.recipients_count.toLocaleString()}</div>
                            <div className="text-xs text-gray-500">total</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-green-600">✓ {campaign.delivered_count}</span>
                              <span className="text-red-600">✗ {campaign.failed_count}</span>
                              <span className="text-orange-600">⏳ {campaign.pending_count}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                                style={{ width: `${getDeliveryRate(campaign.delivered_count, campaign.recipients_count)}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-gray-500 text-center">
                              {getDeliveryRate(campaign.delivered_count, campaign.recipients_count)}% delivered
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(campaign.status)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(campaign.created_at).toLocaleDateString()}
                            <div className="text-xs text-gray-500">
                              {new Date(campaign.created_at).toLocaleTimeString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => exportCampaignData(campaign)}>
                              <Download className="h-3 w-3 mr-1" />
                              Export
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {filteredCampaigns.length === 0 && (
                  <div className="text-center py-12">
                    <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">No campaigns found</p>
                    <p className="text-sm text-gray-400 mb-4">Create your first campaign to get started</p>
                    <Button onClick={() => router.push('/dashboard/prepare')} size="lg">
                      <Send className="h-4 w-4 mr-2" />
                      Create Campaign
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}