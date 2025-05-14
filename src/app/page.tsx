
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link'; // Keep if you plan to add sign-up links etc.

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LogInIcon } from 'lucide-react';
import { ShelfPilotLogo } from '@/components/icons/shelf-pilot-logo';
import { auth } from '@/lib/firebase'; // Import Firebase auth
import { signInWithEmailAndPassword } from 'firebase/auth'; // Import Firebase auth function

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

type LoginFormValues = z.infer<typeof formSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit: SubmitHandler<LoginFormValues> = async (data) => {
    setIsLoading(true);
    try {
      // Sign in with Firebase
      await signInWithEmailAndPassword(auth, data.email, data.password);
      
      toast({
        title: 'Login Successful!',
        description: 'Welcome back!',
      });
      router.push('/dashboard'); // Redirect to dashboard
    } catch (error: any) {
      console.error('Firebase login error:', error);
      let errorMessage = 'An unexpected error occurred. Please try again.';
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address format.';
          break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential': // Covers both wrong password and user not found for newer SDK versions
          errorMessage = 'Invalid email or password. Please try again.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many login attempts. Please try again later.';
          break;
        default:
          errorMessage = 'Login failed. Please try again.';
      }
      toast({
        title: 'Login Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto mb-4">
          <ShelfPilotLogo className="h-12 w-12 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold">Login to ShelfPilot</CardTitle>
        <CardDescription>Enter your email and password to access your account.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="you@example.com" {...field} />
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
                  <div className="flex items-center justify-between">
                    <FormLabel>Password</FormLabel>
                    {/* <Link href="/auth/forgot-password" // Placeholder for forgot password
                          className="text-sm font-medium text-primary hover:underline">
                      Forgot password?
                    </Link> */}
                  </div>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogInIcon className="mr-2 h-4 w-4" />
              )}
              Login
            </Button>
          </form>
        </Form>
      </CardContent>
      {/* <CardFooter className="flex flex-col items-center space-y-2 text-sm">
        <p className="text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-medium text-primary hover:underline"> // Example future signup link
            Sign Up
          </Link>
        </p>
      </CardFooter> */}
    </Card>
  );
}
