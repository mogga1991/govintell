"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { signIn } from "next-auth/react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { cn } from "@/lib/utils"
import { userAuthSchema, userSignupSchema, userCredentialsSchema } from "@/lib/validations/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Icons } from "@/components/icons"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface UserAuthFormEnhancedProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultTab?: "signin" | "signup"
}

type EmailFormData = z.infer<typeof userAuthSchema>
type SignupFormData = z.infer<typeof userSignupSchema>
type CredentialsFormData = z.infer<typeof userCredentialsSchema>

export function UserAuthFormEnhanced({ 
  className, 
  defaultTab = "signin",
  ...props 
}: UserAuthFormEnhancedProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [isGitHubLoading, setIsGitHubLoading] = React.useState<boolean>(false)
  const [activeTab, setActiveTab] = React.useState(defaultTab)

  // Email magic link form
  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(userAuthSchema),
  })

  // Signup form
  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(userSignupSchema),
  })

  // Credentials signin form
  const credentialsForm = useForm<CredentialsFormData>({
    resolver: zodResolver(userCredentialsSchema),
  })

  async function onEmailSubmit(data: EmailFormData) {
    setIsLoading(true)

    const signInResult = await signIn("email", {
      email: data.email.toLowerCase(),
      redirect: false,
      callbackUrl: searchParams?.get("from") || "/dashboard",
    })

    setIsLoading(false)

    if (!signInResult?.ok) {
      return toast({
        title: "Something went wrong.",
        description: "Your sign in request failed. Please try again.",
        variant: "destructive",
      })
    }

    return toast({
      title: "Check your email",
      description: "We sent you a login link. Be sure to check your spam too.",
    })
  }

  async function onSignupSubmit(data: SignupFormData) {
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Signup failed")
      }

      // Auto-signin after successful signup
      const signInResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
        callbackUrl: searchParams?.get("from") || "/dashboard",
      })

      if (signInResult?.ok) {
        router.push(searchParams?.get("from") || "/dashboard")
        toast({
          title: "Account created successfully!",
          description: "You have been signed in automatically.",
        })
      }
    } catch (error) {
      toast({
        title: "Something went wrong.",
        description: error instanceof Error ? error.message : "Signup failed. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function onCredentialsSubmit(data: CredentialsFormData) {
    setIsLoading(true)

    const signInResult = await signIn("credentials", {
      email: data.email.toLowerCase(),
      password: data.password,
      redirect: false,
      callbackUrl: searchParams?.get("from") || "/dashboard",
    })

    setIsLoading(false)

    if (!signInResult?.ok) {
      return toast({
        title: "Invalid credentials",
        description: "Please check your email and password and try again.",
        variant: "destructive",
      })
    }

    router.push(searchParams?.get("from") || "/dashboard")
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "signin" | "signup")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signin">Sign In</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        
        <TabsContent value="signin" className="space-y-4">
          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email">Magic Link</TabsTrigger>
              <TabsTrigger value="password">Password</TabsTrigger>
            </TabsList>
            
            <TabsContent value="email">
              <form onSubmit={emailForm.handleSubmit(onEmailSubmit)}>
                <div className="grid gap-2">
                  <div className="grid gap-1">
                    <Label className="sr-only" htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      placeholder="name@company.com"
                      type="email"
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect="off"
                      disabled={isLoading || isGitHubLoading}
                      {...emailForm.register("email")}
                    />
                    {emailForm.formState.errors?.email && (
                      <p className="px-1 text-xs text-red-600">
                        {emailForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                  <Button disabled={isLoading}>
                    {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                    Send Magic Link
                  </Button>
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="password">
              <form onSubmit={credentialsForm.handleSubmit(onCredentialsSubmit)}>
                <div className="grid gap-2">
                  <div className="grid gap-1">
                    <Label className="sr-only" htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      placeholder="name@company.com"
                      type="email"
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect="off"
                      disabled={isLoading || isGitHubLoading}
                      {...credentialsForm.register("email")}
                    />
                    {credentialsForm.formState.errors?.email && (
                      <p className="px-1 text-xs text-red-600">
                        {credentialsForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                  <div className="grid gap-1">
                    <Label className="sr-only" htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      placeholder="Password"
                      type="password"
                      autoComplete="current-password"
                      disabled={isLoading || isGitHubLoading}
                      {...credentialsForm.register("password")}
                    />
                    {credentialsForm.formState.errors?.password && (
                      <p className="px-1 text-xs text-red-600">
                        {credentialsForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                  <Button disabled={isLoading}>
                    {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                    Sign In
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="signup" className="space-y-4">
          <form onSubmit={signupForm.handleSubmit(onSignupSubmit)}>
            <div className="grid gap-2">
              <div className="grid gap-1">
                <Label className="sr-only" htmlFor="signup-name">Name</Label>
                <Input
                  id="signup-name"
                  placeholder="Your full name"
                  type="text"
                  autoCapitalize="words"
                  autoComplete="name"
                  autoCorrect="off"
                  disabled={isLoading || isGitHubLoading}
                  {...signupForm.register("name")}
                />
                {signupForm.formState.errors?.name && (
                  <p className="px-1 text-xs text-red-600">
                    {signupForm.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div className="grid gap-1">
                <Label className="sr-only" htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  placeholder="name@company.com"
                  type="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  disabled={isLoading || isGitHubLoading}
                  {...signupForm.register("email")}
                />
                {signupForm.formState.errors?.email && (
                  <p className="px-1 text-xs text-red-600">
                    {signupForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div className="grid gap-1">
                <Label className="sr-only" htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  placeholder="Create a strong password"
                  type="password"
                  autoComplete="new-password"
                  disabled={isLoading || isGitHubLoading}
                  {...signupForm.register("password")}
                />
                {signupForm.formState.errors?.password && (
                  <p className="px-1 text-xs text-red-600">
                    {signupForm.formState.errors.password.message}
                  </p>
                )}
              </div>
              <Button disabled={isLoading}>
                {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                Create Account
              </Button>
            </div>
          </form>
        </TabsContent>
      </Tabs>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      
      <Button
        variant="outline"
        type="button"
        disabled={isLoading || isGitHubLoading}
        onClick={() => {
          setIsGitHubLoading(true)
          signIn("github", {
            callbackUrl: searchParams?.get("from") || "/dashboard",
          })
        }}
      >
        {isGitHubLoading ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icons.gitHub className="mr-2 h-4 w-4" />
        )}
        GitHub
      </Button>
    </div>
  )
}