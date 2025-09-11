'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function LandingPage() {
  const router = useRouter()
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [isLoading, setIsLoading] = useState(false)

  const features = [
    {
      title: "Template Management",
      description: "Create, edit, and manage reusable message templates for quick messaging.",
      icon: "📝"
    },
    {
      title: "User Management",
      description: "Admin can manage end users with full CRUD operations.",
      icon: "👥"
    },
    {
      title: "Duplicate Detection",
      description: "Smart contact management with automatic duplicate detection and prevention.",
      icon: "🔄"
    },
    {
      title: "Message Composition",
      description: "Compose messages using templates with easy editing capabilities.",
      icon: "💬"
    }
  ]

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginForm),
      })

      if (response.ok) {
        toast.success('Login successful')
        router.push('/dashboard')
      } else {
        toast.error('Invalid credentials')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Navigation */}
      <nav className="responsive-nav bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center responsive-nav">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="responsive-nav-logo font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  WhatsX
                </h1>
              </div>
              <div className="hidden md:block ml-10">
                <div className="flex items-baseline space-x-4">
                  <a href="#features" className="responsive-text-base text-gray-600 hover:text-green-600 px-3 py-2 rounded-md font-medium transition-colors">
                    Features
                  </a>
                  <a href="#about" className="responsive-text-base text-gray-600 hover:text-green-600 px-3 py-2 rounded-md font-medium transition-colors">
                    About
                  </a>
                  <a href="#contact" className="responsive-text-base text-gray-600 hover:text-green-600 px-3 py-2 rounded-md font-medium transition-colors">
                    Contact
                  </a>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="responsive-nav-button hover:bg-green-50 hover:text-green-600 hover:border-green-300 transition-all"
                  >
                    Login
                  </Button>
                </DialogTrigger>
                <DialogContent className="responsive-dialog">
                  <form onSubmit={handleLogin}>
                    <DialogHeader>
                      <DialogTitle className="responsive-text-xl font-bold">Login to WhatsX</DialogTitle>
                      <DialogDescription className="responsive-text-base">
                        Enter your credentials to access your dashboard
                      </DialogDescription>
                    </DialogHeader>
                    <div className="mobile-form tablet-form desktop-form">
                      <div className="mobile-form-group tablet-form-group desktop-form-group">
                        <Label htmlFor="email" className="mobile-form-label tablet-form-label desktop-form-label">
                          Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={loginForm.email}
                          onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                          className="responsive-input"
                          required
                        />
                      </div>
                      <div className="mobile-form-group tablet-form-group desktop-form-group">
                        <Label htmlFor="password" className="mobile-form-label tablet-form-label desktop-form-label">
                          Password
                        </Label>
                        <Input
                          id="password"
                          type="password"
                          value={loginForm.password}
                          onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                          className="responsive-input"
                          required
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button 
                        type="submit" 
                        className="responsive-button bg-green-600 hover:bg-green-700"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
              <Button 
                onClick={() => router.push('/auth/login')}
                className="responsive-nav-button bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-6 sm:mb-8">
            <Badge variant="secondary" className="responsive-text-base bg-green-100 text-green-800 border-green-200">
              Advanced WhatsApp Messaging & Automation
            </Badge>
          </div>
          <h1 className="responsive-text-2xl sm:responsive-text-3xl lg:responsive-text-4xl xl:responsive-text-5xl font-bold text-gray-900 mb-4 sm:mb-6 lg:mb-8 leading-tight">
            <span className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              Streamline Your WhatsApp Communication
            </span>
          </h1>
          <p className="responsive-text-base sm:responsive-text-lg lg:responsive-text-xl text-gray-600 mb-8 sm:mb-10 lg:mb-12 max-w-3xl mx-auto leading-relaxed">
            Professional messaging automation platform for businesses and organizations. 
            Manage templates, contacts, and users with intelligent duplicate detection.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Button 
              size="lg" 
              className="responsive-button-lg bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              onClick={() => router.push('/auth/login')}
            >
              Get Started Free
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="responsive-button-lg border-2 hover:bg-green-50 hover:text-green-600 hover:border-green-300 transition-all transform hover:scale-105"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="responsive-text-xl sm:responsive-text-2xl lg:responsive-text-3xl font-bold text-gray-900 mb-4 sm:mb-6">
              Powerful Features for Your Business
            </h2>
            <p className="responsive-text-base sm:responsive-text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Everything you need to automate and manage your WhatsApp communication effectively
            </p>
          </div>
          
          <div className="responsive-grid">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="responsive-card group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-0 shadow-lg bg-white/80 backdrop-blur-sm"
              >
                <CardHeader className="responsive-card-header text-center">
                  <div className="responsive-text-4xl mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <CardTitle className="responsive-card-title text-gray-900 group-hover:text-green-600 transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="responsive-card-content text-center">
                  <CardDescription className="responsive-text-base leading-relaxed text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-4 sm:space-y-6">
              <h2 className="responsive-text-xl sm:responsive-text-2xl lg:responsive-text-3xl font-bold text-gray-900">
                About WhatsX
              </h2>
              <p className="responsive-text-base sm:responsive-text-lg text-gray-600 leading-relaxed">
                WhatsX is a comprehensive WhatsApp messaging automation platform designed for businesses, 
                educational institutions, and organizations of all sizes. Our platform extends the capabilities 
                of standard WhatsApp by providing advanced features for bulk messaging, template management, 
                and intelligent contact handling.
              </p>
              <p className="responsive-text-base sm:responsive-text-lg text-gray-600 leading-relaxed">
                Built with modern technology and following best practices, WhatsX ensures secure, efficient, 
                and scalable communication management for your organization.
              </p>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <Badge variant="outline" className="responsive-badge border-green-200 text-green-700 bg-green-50">
                  Secure Authentication
                </Badge>
                <Badge variant="outline" className="responsive-badge border-blue-200 text-blue-700 bg-blue-50">
                  Role-Based Access
                </Badge>
                <Badge variant="outline" className="responsive-badge border-purple-200 text-purple-700 bg-purple-50">
                  Duplicate Detection
                </Badge>
                <Badge variant="outline" className="responsive-badge border-orange-200 text-orange-700 bg-orange-50">
                  Template Management
                </Badge>
              </div>
            </div>
            <div className="responsive-card bg-white/80 backdrop-blur-sm shadow-xl border-0">
              <div className="responsive-card-header">
                <h3 className="responsive-text-lg sm:responsive-text-xl font-bold text-gray-900 mb-3 sm:mb-4">
                  Key Capabilities
                </h3>
              </div>
              <div className="responsive-card-content">
                <ul className="space-y-2 sm:space-y-3">
                  <li className="flex items-center responsive-text-base">
                    <span className="text-green-600 mr-2 sm:mr-3 text-lg sm:text-xl">✓</span>
                    <span>Admin and End User roles</span>
                  </li>
                  <li className="flex items-center responsive-text-base">
                    <span className="text-green-600 mr-2 sm:mr-3 text-lg sm:text-xl">✓</span>
                    <span>Message template management</span>
                  </li>
                  <li className="flex items-center responsive-text-base">
                    <span className="text-green-600 mr-2 sm:mr-3 text-lg sm:text-xl">✓</span>
                    <span>User management (Admin only)</span>
                  </li>
                  <li className="flex items-center responsive-text-base">
                    <span className="text-green-600 mr-2 sm:mr-3 text-lg sm:text-xl">✓</span>
                    <span>Duplicate contact prevention</span>
                  </li>
                  <li className="flex items-center responsive-text-base">
                    <span className="text-green-600 mr-2 sm:mr-3 text-lg sm:text-xl">✓</span>
                    <span>CSV contact upload</span>
                  </li>
                  <li className="flex items-center responsive-text-base">
                    <span className="text-green-600 mr-2 sm:mr-3 text-lg sm:text-xl">✓</span>
                    <span>Message composition with templates</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="responsive-text-xl sm:responsive-text-2xl lg:responsive-text-3xl font-bold text-gray-900 mb-4 sm:mb-6 lg:mb-8">
            Ready to Transform Your Communication?
          </h2>
          <p className="responsive-text-base sm:responsive-text-lg text-gray-600 mb-8 sm:mb-10 lg:mb-12 max-w-3xl mx-auto leading-relaxed">
            Join thousands of businesses using WhatsX to streamline their WhatsApp communication
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Button 
              size="lg" 
              className="responsive-button-lg bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              onClick={() => router.push('/auth/login')}
            >
              Start Free Trial
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="responsive-button-lg border-2 hover:bg-green-50 hover:text-green-600 hover:border-green-300 transition-all transform hover:scale-105"
              onClick={() => setIsLoginOpen(true)}
            >
              Login to Account
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="space-y-3 sm:space-y-4">
              <h3 className="responsive-text-xl sm:responsive-text-2xl font-bold text-green-400">WhatsX</h3>
              <p className="responsive-text-base text-gray-300 leading-relaxed">
                Advanced WhatsApp Messaging & Automation platform for modern businesses.
              </p>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <h4 className="responsive-text-base sm:responsive-text-lg font-semibold text-white">Features</h4>
              <ul className="space-y-1 sm:space-y-2 text-gray-300">
                <li className="responsive-text-sm hover:text-green-400 transition-colors cursor-pointer">Template Management</li>
                <li className="responsive-text-sm hover:text-green-400 transition-colors cursor-pointer">User Management</li>
                <li className="responsive-text-sm hover:text-green-400 transition-colors cursor-pointer">Contact Management</li>
                <li className="responsive-text-sm hover:text-green-400 transition-colors cursor-pointer">Message Automation</li>
              </ul>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <h4 className="responsive-text-base sm:responsive-text-lg font-semibold text-white">Company</h4>
              <ul className="space-y-1 sm:space-y-2 text-gray-300">
                <li><a href="#about" className="responsive-text-sm hover:text-green-400 transition-colors">About Us</a></li>
                <li><a href="#features" className="responsive-text-sm hover:text-green-400 transition-colors">Features</a></li>
                <li><a href="#contact" className="responsive-text-sm hover:text-green-400 transition-colors">Contact</a></li>
              </ul>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <h4 className="responsive-text-base sm:responsive-text-lg font-semibold text-white">Support</h4>
              <ul className="space-y-1 sm:space-y-2 text-gray-300">
                <li className="responsive-text-sm hover:text-green-400 transition-colors cursor-pointer">Help Center</li>
                <li className="responsive-text-sm hover:text-green-400 transition-colors cursor-pointer">Documentation</li>
                <li className="responsive-text-sm hover:text-green-400 transition-colors cursor-pointer">Contact Support</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 sm:mt-12 pt-6 sm:pt-8 text-center">
            <p className="responsive-text-sm text-gray-400">
              © 2025 WhatsX. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}