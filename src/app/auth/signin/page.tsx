'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      console.log('SIGNIN DEBUG: Attempting sign in with:', email)
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      console.log('SIGNIN DEBUG: Sign in result:', result)

      if (result?.error) {
        console.error('SIGNIN DEBUG: Sign in error:', result.error)
        setError(`Authentication failed: ${result.error}`)
      } else {
        console.log('SIGNIN DEBUG: Sign in successful, getting session...')
        // Get session to check user role
        const session = await getSession()
        console.log('SIGNIN DEBUG: Session retrieved:', session)
        
        if (session?.user?.role) {
          console.log('SIGNIN DEBUG: User role found:', session.user.role)
          router.push('/dashboard')
        } else {
          console.error('SIGNIN DEBUG: No session or user role found')
          setError('Authentication successful but no session data found')
        }
      }
    } catch (error) {
      console.error('SIGNIN DEBUG: Sign in exception:', error)
      setError(`An error occurred: ${error.message || 'Please try again.'}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>
            Enter your credentials to access the WhatsX platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          
          <div className="mt-4 text-center text-sm">
            <p>
              Don't have an account?{' '}
              <Link href="/auth/signup" className="text-blue-600 hover:underline">
                Sign up
              </Link>
            </p>
          </div>
          
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold mb-2">Test Accounts:</h3>
            <div className="space-y-1 text-sm">
              <p><strong>Admin:</strong> admin@whatsx.com / admin123</p>
              <p><strong>User:</strong> user@whatsx.com / user123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}