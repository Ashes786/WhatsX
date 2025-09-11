'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email: loginForm.email,
        password: loginForm.password,
        redirect: false,
      })

      if (result?.error) {
        toast.error('Invalid credentials')
      } else {
        toast.success('Login successful')
        router.push('/dashboard')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex justify-center mb-3 sm:mb-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="responsive-text-2xl sm:responsive-text-3xl font-bold text-white">W</span>
            </div>
          </div>
          <h1 className="responsive-text-2xl sm:responsive-text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-1 sm:mb-2">
            WhatsX
          </h1>
          <p className="responsive-text-base sm:responsive-text-lg text-gray-600">Advanced WhatsApp Messaging & Automation</p>
        </div>

        <Card className="responsive-card border-0 shadow-xl bg-white/95 backdrop-blur-sm">
          <CardHeader className="responsive-card-header text-center pb-4 sm:pb-6">
            <CardTitle className="responsive-text-xl sm:responsive-text-2xl font-bold text-gray-900">Welcome Back</CardTitle>
            <CardDescription className="responsive-text-base sm:responsive-text-lg text-gray-600">
              Sign in to your account to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="responsive-card-content">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-6">
                <TabsTrigger value="login" className="responsive-text-sm sm:responsive-text-base">Login</TabsTrigger>
                <TabsTrigger value="demo" className="responsive-text-sm sm:responsive-text-base">Demo Accounts</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-3 sm:space-y-4">
                <form onSubmit={handleLogin} className="mobile-form tablet-form desktop-form">
                  <div className="mobile-form-group tablet-form-group desktop-form-group">
                    <Label htmlFor="email" className="mobile-form-label tablet-form-label desktop-form-label">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      className="responsive-input"
                      required
                      placeholder="Enter your email"
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
                      placeholder="Enter your password"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="responsive-button-lg w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="demo" className="space-y-3 sm:space-y-4">
                <div className="mobile-form tablet-form desktop-form">
                  <div className="text-sm text-gray-600 mb-3 sm:mb-4">
                    <p className="font-semibold mb-2 sm:mb-3">Demo Accounts:</p>
                  </div>
                  
                  <div className="space-y-2 sm:space-y-3">
                    <div className="p-3 sm:p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                      <div className="flex justify-between items-start sm:items-center">
                        <div className="flex-1">
                          <p className="font-medium responsive-text-sm sm:responsive-text-base text-green-800">Admin Account</p>
                          <p className="responsive-text-xs sm:responsive-text-sm text-green-600">admin@whatsx.com</p>
                          <p className="responsive-text-xs sm:responsive-text-sm text-green-600">Password: admin123</p>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="responsive-button-xs sm:responsive-button-sm border-green-300 text-green-700 hover:bg-green-50"
                          onClick={() => {
                            setLoginForm({ email: 'admin@whatsx.com', password: 'admin123' })
                          }}
                        >
                          Use
                        </Button>
                      </div>
                    </div>
                    
                    <div className="p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                      <div className="flex justify-between items-start sm:items-center">
                        <div className="flex-1">
                          <p className="font-medium responsive-text-sm sm:responsive-text-base text-blue-800">Demo User</p>
                          <p className="responsive-text-xs sm:responsive-text-sm text-blue-600">user@demo.com</p>
                          <p className="responsive-text-xs sm:responsive-text-sm text-blue-600">Password: demo123</p>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="responsive-button-xs sm:responsive-button-sm border-blue-300 text-blue-700 hover:bg-blue-50"
                          onClick={() => {
                            setLoginForm({ email: 'user@demo.com', password: 'demo123' })
                          }}
                        >
                          Use
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 text-center mt-3 sm:mt-4">
                    <p>Click "Use" to auto-fill the credentials, then switch to Login tab to sign in.</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <div className="text-center mt-6 sm:mt-8">
          <Button 
            variant="link" 
            onClick={() => router.push('/')}
            className="responsive-text-sm sm:responsive-text-base text-gray-600 hover:text-green-600 transition-colors"
          >
            ← Back to Home
          </Button>
        </div>
      </div>
    </div>
  )
}