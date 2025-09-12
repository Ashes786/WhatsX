'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  MessageSquare, 
  Users, 
  FileText, 
  Shield, 
  BarChart3, 
  Zap, 
  Globe, 
  CheckCircle,
  ArrowRight,
  Star,
  Award,
  TrendingUp
} from 'lucide-react'

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading WhatsX Platform...</p>
        </div>
      </div>
    )
  }

  if (status === 'authenticated') {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-lg">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                WhatsX
              </span>
              <Badge variant="secondary" className="hidden sm:flex items-center gap-1">
                <Star className="h-3 w-3" />
                Enterprise
              </Badge>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
                Features
              </a>
              <a href="#solutions" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
                Solutions
              </a>
              <a href="#benefits" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
                Benefits
              </a>
              <a href="#testimonials" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
                Testimonials
              </a>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => router.push('/auth/login')} className="hidden sm:flex">
                Login
              </Button>
              <Button onClick={() => router.push('/auth/login')} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8">
            <Badge className="mb-4 inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border-blue-200">
              <Award className="h-4 w-4" />
              Award-Winning Platform
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Transform Your 
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent block">
                Messaging Strategy
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              The enterprise-grade messaging automation platform that empowers teams to deliver personalized, 
              targeted messages at scale while eliminating duplicates and ensuring compliance.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" onClick={() => router.push('/auth/login')} className="text-lg px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-4 border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50">
              Watch Demo
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">10M+</div>
              <div className="text-gray-600">Messages Processed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">99.9%</div>
              <div className="text-gray-600">Uptime SLA</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">50K+</div>
              <div className="text-gray-600">Active Users</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Powerful Features for Modern Teams</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to streamline your messaging operations and deliver exceptional customer experiences
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Template Management</CardTitle>
                <CardDescription className="text-gray-600">
                  Create, manage, and deploy professional message templates with dynamic personalization
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="text-left space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Rich text editor
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Dynamic variables
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Version control
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-xl">User Management</CardTitle>
                <CardDescription className="text-gray-600">
                  Comprehensive user administration with role-based access control and monitoring
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="text-left space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Role-based permissions
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Activity monitoring
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    User analytics
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Duplicate Prevention</CardTitle>
                <CardDescription className="text-gray-600">
                  Advanced duplicate detection with intelligent phone number normalization
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="text-left space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    E.164 normalization
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Real-time detection
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Comprehensive reporting
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center">
                <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-8 w-8 text-orange-600" />
                </div>
                <CardTitle className="text-xl">Analytics & Insights</CardTitle>
                <CardDescription className="text-gray-600">
                  Powerful analytics dashboard with real-time metrics and performance insights
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="text-left space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Real-time dashboards
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Custom reports
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Performance metrics
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section id="solutions" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Solutions for Every Business</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tailored solutions to meet your specific messaging needs
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Globe className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">Marketing Teams</CardTitle>
                </div>
                <CardDescription className="text-gray-600">
                  Scale your marketing campaigns with personalized messaging and automated workflows
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <Zap className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    Bulk campaign management
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    A/B testing capabilities
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    Segmented targeting
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle className="text-xl">Customer Support</CardTitle>
                </div>
                <CardDescription className="text-gray-600">
                  Enhance customer support with automated responses and efficient communication
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <Zap className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    Automated responses
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    Ticket management
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    Priority routing
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                  <CardTitle className="text-xl">Sales Teams</CardTitle>
                </div>
                <CardDescription className="text-gray-600">
                  Boost sales productivity with automated follow-ups and lead nurturing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <Zap className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    Lead nurturing sequences
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    Follow-up automation
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    Conversion tracking
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose WhatsX?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the difference that enterprise-grade messaging automation can make
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Enterprise Security</h3>
              <p className="text-gray-600">Bank-level encryption and compliance with global data protection standards</p>
            </div>
            
            <div className="text-center">
              <div className="bg-gradient-to-br from-green-600 to-teal-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
              <p className="text-gray-600">Process millions of messages with our optimized infrastructure</p>
            </div>
            
            <div className="text-center">
              <div className="bg-gradient-to-br from-purple-600 to-pink-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Analytics</h3>
              <p className="text-gray-600">Gain actionable insights with comprehensive reporting and analytics</p>
            </div>
            
            <div className="text-center">
              <div className="bg-gradient-to-br from-orange-600 to-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Global Reach</h3>
              <p className="text-gray-600">Connect with customers worldwide with multi-language support</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Messaging Strategy?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of companies already using WhatsX to deliver exceptional customer experiences at scale.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => router.push('/auth/login')} className="text-lg px-8 py-4 bg-white text-blue-600 hover:bg-gray-100 shadow-lg">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-4 border-2 border-white text-blue-600 hover:bg-white hover:text-blue-600">
              Schedule a Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold">WhatsX</span>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Enterprise-grade messaging automation platform for modern businesses.
              </p>
              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer">
                  <span className="text-xs">f</span>
                </div>
                <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer">
                  <span className="text-xs">t</span>
                </div>
                <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer">
                  <span className="text-xs">in</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Solutions</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 WhatsX. All rights reserved. | Privacy Policy | Terms of Service</p>
          </div>
        </div>
      </footer>
    </div>
  )
}