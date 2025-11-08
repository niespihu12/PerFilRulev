'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth'
import { useAuth, useUser } from '@/firebase'
import { useToast } from '@/hooks/use-toast'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Logo } from '@/components/logo'
import { Loader2 } from 'lucide-react'

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
})

type SignupFormValues = z.infer<typeof signupSchema>

export default function SignupPage() {
  const router = useRouter()
  const auth = useAuth()
  const { user, isUserLoading } = useUser()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  })

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/dashboard')
    }
  }, [user, isUserLoading, router])

  const handleSignup = async (data: SignupFormValues) => {
    if (auth) {
      setIsLoading(true)
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          data.email,
          data.password
        )
        await updateProfile(userCredential.user, {
          displayName: data.name,
        })
        router.push('/dashboard')
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Sign Up Failed',
          description: error.message || 'An unexpected error occurred.',
        })
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleGoogleSignIn = async () => {
    if (auth) {
      const provider = new GoogleAuthProvider()
      try {
        await signInWithPopup(auth, provider)
        router.push('/dashboard')
      } catch (error) {
        console.error('Error signing in with Google', error)
        toast({
          variant: 'destructive',
          title: 'Sign Up Failed',
          description: 'Could not sign in with Google. Please try again.',
        })
      }
    }
  }

  if (isUserLoading || (!isUserLoading && user)) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <Card className="mx-auto w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <Logo />
          </div>
          <CardTitle className="text-2xl font-headline">Create an Account</CardTitle>
          <CardDescription>
            Enter your information to get started with your financial dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSignup)} className="grid gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="m@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                 {isLoading ? <Loader2 className="animate-spin" /> : "Sign Up"}
              </Button>
            </form>
          </Form>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          <Button variant="outline" className="w-full" type="button" onClick={handleGoogleSignIn}>
             <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-72.2 72.2C321.7 105.3 287.4 96 248 96c-88.8 0-160.1 71.1-160.1 160.1s71.3 160.1 160.1 160.1c98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>
            Google
          </Button>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/" className="underline">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
