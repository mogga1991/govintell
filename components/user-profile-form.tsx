"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { User } from "@prisma/client"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { cn } from "@/lib/utils"
import { userProfileFormSchema } from "@/lib/validations/user"
import { checkProfileCompletion } from "@/lib/user"
import { UserProfile } from "@/types/user-profile"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Icons } from "@/components/icons"
import { NaicsSelector } from "@/components/naics-selector"
import { PscSelector } from "@/components/psc-selector"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface UserProfileFormProps extends React.HTMLAttributes<HTMLFormElement> {
  user: UserProfile & { name?: string | null; email?: string | null }
}

type FormData = z.infer<typeof userProfileFormSchema>

export function UserProfileForm({ user, className, ...props }: UserProfileFormProps) {
  const router = useRouter()
  const [isSaving, setIsSaving] = React.useState<boolean>(false)
  
  // Calculate current profile status
  const profileStatus = checkProfileCompletion(user)
  
  const {
    handleSubmit,
    register,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(userProfileFormSchema),
    defaultValues: {
      company_name: user?.company_name || "",
      naics_codes: user?.naics_codes || "",
      psc_codes: user?.psc_codes || "",
    },
  })

  const watchedNaicsCodes = watch("naics_codes")
  const watchedPscCodes = watch("psc_codes")

  async function onSubmit(data: FormData) {
    setIsSaving(true)

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response?.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update profile")
      }

      const result = await response.json()
      
      toast({
        title: "Profile updated successfully!",
        description: `Profile completion: ${result.profile_status.completion_percentage}%`,
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "Something went wrong.",
        description: error instanceof Error ? error.message : "Your profile was not updated. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="grid gap-6">
      {/* Profile Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Profile Completion Status
            <Badge variant={profileStatus.isComplete ? "default" : "secondary"}>
              {profileStatus.completionPercentage}% Complete
            </Badge>
          </CardTitle>
          <CardDescription>
            Complete your business profile to get better RFQ matches
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={profileStatus.completionPercentage} className="w-full" />
          
          {!profileStatus.isComplete && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Missing information:</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                {profileStatus.missingFields.includes("company_name") && (
                  <li>Company name</li>
                )}
                {profileStatus.missingFields.includes("naics_codes") && (
                  <li>NAICS codes</li>
                )}
                {profileStatus.missingFields.includes("psc_codes") && (
                  <li>PSC codes</li>
                )}
              </ul>
            </div>
          )}
          
          {profileStatus.isComplete && (
            <p className="text-sm text-green-600">
              ✓ Your profile is complete and ready for RFQ matching!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Profile Form */}
      <form
        className={cn(className)}
        onSubmit={handleSubmit(onSubmit)}
        {...props}
      >
        <Card>
          <CardHeader>
            <CardTitle>Business Profile</CardTitle>
            <CardDescription>
              Provide your company information to get personalized RFQ recommendations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Company Name */}
            <div className="space-y-2">
              <Label htmlFor="company_name">
                Company Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="company_name"
                placeholder="e.g., ABC Contracting LLC"
                {...register("company_name")}
              />
              {errors?.company_name && (
                <p className="text-xs text-red-600">{errors.company_name.message}</p>
              )}
            </div>

            {/* NAICS Codes */}
            <div className="space-y-2">
              <Label htmlFor="naics_codes">
                NAICS Codes <span className="text-red-500">*</span>
              </Label>
              <p className="text-sm text-muted-foreground">
                Select the NAICS codes that best describe your business activities. This helps match you with relevant government opportunities.
              </p>
              <NaicsSelector
                value={watchedNaicsCodes}
                onChange={(value) => setValue("naics_codes", value)}
                placeholder="Search and select NAICS codes..."
                maxSelections={5}
              />
              {errors?.naics_codes && (
                <p className="text-xs text-red-600">{errors.naics_codes.message}</p>
              )}
            </div>

            {/* PSC Codes */}
            <div className="space-y-2">
              <Label htmlFor="psc_codes">
                PSC Codes <span className="text-red-500">*</span>
              </Label>
              <p className="text-sm text-muted-foreground">
                Select the Product Service Codes (PSC) that best describe your products and services. This helps match you with relevant government contracts.
              </p>
              <PscSelector
                value={watchedPscCodes}
                onChange={(value) => setValue("psc_codes", value)}
                placeholder="Search and select PSC codes..."
                maxSelections={5}
              />
              {errors?.psc_codes && (
                <p className="text-xs text-red-600">{errors.psc_codes.message}</p>
              )}
            </div>

            {/* Account Information (Read-only) */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-sm font-medium">Account Information</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Name</Label>
                  <p className="text-sm">{user.name || "Not provided"}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <p className="text-sm">{user.email}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Business Verified</Label>
                  <div className="flex items-center gap-2">
                    {user.business_verified ? (
                      <Badge variant="default" className="text-xs">Verified</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">Not Verified</Badge>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Member Since</Label>
                  <p className="text-sm">
                    {user.id ? "Active Account" : "New Account"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <button
              type="submit"
              className={cn(buttonVariants(), "w-full sm:w-auto")}
              disabled={isSaving}
            >
              {isSaving && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              <span>Save Business Profile</span>
            </button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}