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
import { buttonVariants, Button } from "@/components/ui/button"
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface UserProfileFormEnhancedProps extends React.HTMLAttributes<HTMLFormElement> {
  user: UserProfile & { name?: string | null; email?: string | null }
  variant?: "full" | "progressive" | "compact"
  showCompletionCard?: boolean
}

type FormData = z.infer<typeof userProfileFormSchema>

// Progressive disclosure steps
type FormStep = 1 | 2 | 3

// Field help text and examples
const FIELD_HELP = {
  company_name: {
    help: "Enter your official company name as registered with government agencies. This will appear on contracts and documentation.",
    placeholder: "e.g., ABC Construction LLC, TechSolutions Inc",
    examples: ["ABC Construction LLC", "TechSolutions Inc", "Green Energy Corp"],
    hint: "Required field. Must be at least 2 characters long."
  },
  naics_codes: {
    help: "NAICS codes classify your business activities. Select codes that best represent your primary services to improve RFQ matching.",
    placeholder: "Search and select NAICS codes...",
    examples: ["541330 - Engineering Services", "236220 - Commercial Building", "541511 - Custom Computer Programming"],
    hint: "Select 1-5 NAICS codes that represent your business services."
  },
  psc_codes: {
    help: "PSC codes classify your products and services. Select codes that best represent what you provide to improve contract matching.",
    placeholder: "Search and select PSC codes...",
    examples: ["R425 - Engineering Services", "Z1A9 - Maintenance Services", "D316 - IT Services"],
    hint: "Select 1-5 PSC codes that represent your products and services."
  }
}

// Benefits of profile completion
const COMPLETION_BENEFITS = [
  "Receive 3x more relevant RFQ matches",
  "Get personalized opportunity recommendations", 
  "Access advanced filtering and search features",
  "Priority support for business verification"
]

// Form state persistence hooks
function useDraftPersistence(userId: string) {
  const draftKey = `profile_draft_${userId}`
  
  const saveDraft = React.useCallback((formData: Partial<FormData>) => {
    const draftData = {
      ...formData,
      savedAt: new Date().toISOString()
    }
    try {
      localStorage.setItem(draftKey, JSON.stringify(draftData))
    } catch (error) {
      console.warn("Failed to save draft:", error)
    }
  }, [draftKey])

  const getDraft = React.useCallback(() => {
    try {
      const draftJson = localStorage.getItem(draftKey)
      if (draftJson) {
        return JSON.parse(draftJson)
      }
    } catch (error) {
      console.warn("Failed to restore draft:", error)
    }
    return null
  }, [draftKey])

  const clearDraft = React.useCallback(() => {
    try {
      localStorage.removeItem(draftKey)
    } catch (error) {
      console.warn("Failed to clear draft:", error)
    }
  }, [draftKey])

  return { saveDraft, getDraft, clearDraft }
}

// Progressive disclosure hook
function useProgressiveDisclosure(formData: FormData, variant: string) {
  const [currentStep, setCurrentStep] = React.useState<FormStep>(1)
  const [showAllFields, setShowAllFields] = React.useState(variant !== "progressive")

  const shouldAdvanceStep = React.useCallback((step: FormStep, data: FormData) => {
    switch (step) {
      case 1:
        return !!(data.company_name)
      case 2:
        return !!(data.company_name && data.naics_codes)
      case 3:
        return !!(data.company_name && data.naics_codes && data.psc_codes)
      default:
        return false
    }
  }, [])

  const getVisibleFields = React.useCallback((step: FormStep) => {
    if (showAllFields) {
      return ["company_name", "naics_codes", "psc_codes", "business_info"]
    }
    
    const fieldSteps = {
      1: ["company_name"],
      2: ["company_name", "naics_codes"],
      3: ["company_name", "naics_codes", "psc_codes", "business_info"]
    }
    return fieldSteps[step] || []
  }, [showAllFields])

  // Auto-advance step when conditions are met
  React.useEffect(() => {
    if (!showAllFields && shouldAdvanceStep(currentStep, formData)) {
      const nextStep = Math.min(currentStep + 1, 3) as FormStep
      setCurrentStep(nextStep)
    }
  }, [formData, currentStep, shouldAdvanceStep, showAllFields])

  return {
    currentStep,
    setCurrentStep,
    showAllFields,
    setShowAllFields,
    getVisibleFields,
    shouldAdvanceStep
  }
}

export function UserProfileFormEnhanced({ 
  user, 
  variant = "full",
  showCompletionCard = true,
  className, 
  ...props 
}: UserProfileFormEnhancedProps) {
  const router = useRouter()
  const [isSaving, setIsSaving] = React.useState<boolean>(false)
  const [showHelp, setShowHelp] = React.useState<Record<string, boolean>>({})
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false)
  
  const { saveDraft, getDraft, clearDraft } = useDraftPersistence(user.id)
  
  const {
    handleSubmit,
    register,
    setValue,
    watch,
    formState: { errors, isDirty },
    reset
  } = useForm<FormData>({
    resolver: zodResolver(userProfileFormSchema),
    defaultValues: {
      company_name: user?.company_name || "",
      naics_codes: user?.naics_codes || "",
      psc_codes: user?.psc_codes || "",
    },
  })

  const watchedData = watch()
  const { currentStep, showAllFields, setShowAllFields, getVisibleFields } = useProgressiveDisclosure(watchedData, variant)

  // Restore draft data on mount
  React.useEffect(() => {
    const draft = getDraft()
    if (draft && (!user.company_name || !user.naics_codes)) {
      reset({
        company_name: draft.company_name || user?.company_name || "",
        naics_codes: draft.naics_codes || user?.naics_codes || "",
        psc_codes: draft.psc_codes || user?.psc_codes || "",
      })
      toast({
        title: "Draft restored",
        description: "Your previous changes have been restored.",
      })
    }
  }, [getDraft, reset, user])

  // Auto-save draft on form changes
  React.useEffect(() => {
    if (isDirty) {
      setHasUnsavedChanges(true)
      const timeoutId = setTimeout(() => {
        saveDraft(watchedData)
      }, 1000) // Debounce save

      return () => clearTimeout(timeoutId)
    }
  }, [watchedData, isDirty, saveDraft])

  const toggleHelp = (fieldName: string) => {
    setShowHelp(prev => ({
      ...prev,
      [fieldName]: !prev[fieldName]
    }))
  }

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
      
      // Clear draft after successful save
      clearDraft()
      setHasUnsavedChanges(false)
      
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

  const visibleFields = getVisibleFields(currentStep)
  const profileStatus = checkProfileCompletion(user)

  return (
    <div className="grid gap-6">
      {/* Completion Benefits Alert */}
      {!profileStatus.isComplete && (
        <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
          <Icons.lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            <strong>Complete your profile to unlock:</strong>
            <ul className="mt-2 space-y-1 text-sm">
              {COMPLETION_BENEFITS.slice(0, 2).map((benefit, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Icons.checkCircle className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  {benefit}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}


      {/* Unsaved Changes Indicator */}
      {hasUnsavedChanges && (
        <Alert>
          <Icons.alertCircle className="h-4 w-4" />
          <AlertDescription>
            You have unsaved changes. They're automatically saved as you type.
          </AlertDescription>
        </Alert>
      )}

      {/* Profile Form */}
      <form
        className={cn(className)}
        onSubmit={handleSubmit(onSubmit)}
        {...props}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Business Profile</CardTitle>
                <CardDescription>
                  Provide your company information to get personalized RFQ recommendations.
                </CardDescription>
              </div>
              
              {variant === "progressive" && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAllFields(!showAllFields)}
                >
                  {showAllFields ? "Step by Step" : "Show All Fields"}
                </Button>
              )}
            </div>

            {/* Progress Indicator for Progressive Mode */}
            {variant === "progressive" && !showAllFields && (
              <div className="flex items-center gap-2 pt-2">
                <span className="text-sm text-muted-foreground">Step {currentStep} of 3</span>
                <Progress value={(currentStep / 3) * 100} className="flex-1 h-2" />
              </div>
            )}
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Company Name */}
            {visibleFields.includes("company_name") && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="company_name">
                    Company Name <span className="text-red-500">*</span>
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleHelp("company_name")}
                    className="h-6 px-2 text-xs"
                  >
                    <Icons.help className="h-3 w-3 mr-1" />
                    Help
                  </Button>
                </div>

                <Input
                  id="company_name"
                  placeholder={FIELD_HELP.company_name.placeholder}
                  {...register("company_name")}
                />
                
                {errors?.company_name && (
                  <p className="text-xs text-red-600">{errors.company_name.message}</p>
                )}

                <Collapsible open={showHelp.company_name} onOpenChange={(open) => 
                  setShowHelp(prev => ({ ...prev, company_name: open }))
                }>
                  <CollapsibleContent className="space-y-2">
                    <Alert>
                      <AlertDescription className="text-sm">
                        <p className="font-medium mb-2">{FIELD_HELP.company_name.help}</p>
                        <p className="text-muted-foreground mb-2">{FIELD_HELP.company_name.hint}</p>
                        <div>
                          <p className="font-medium mb-1">Examples:</p>
                          <ul className="text-xs space-y-1">
                            {FIELD_HELP.company_name.examples.map((example, index) => (
                              <li key={index} className="text-muted-foreground">• {example}</li>
                            ))}
                          </ul>
                        </div>
                      </AlertDescription>
                    </Alert>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            )}

            {/* NAICS Codes */}
            {visibleFields.includes("naics_codes") && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="naics_codes">
                    NAICS Codes <span className="text-red-500">*</span>
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleHelp("naics_codes")}
                    className="h-6 px-2 text-xs"
                  >
                    <Icons.help className="h-3 w-3 mr-1" />
                    Help
                  </Button>
                </div>

                <NaicsSelector
                  value={watch("naics_codes")}
                  onChange={(value) => setValue("naics_codes", value)}
                  placeholder={FIELD_HELP.naics_codes.placeholder}
                  maxSelections={5}
                />
                
                {errors?.naics_codes && (
                  <p className="text-xs text-red-600">{errors.naics_codes.message}</p>
                )}

                <Collapsible open={showHelp.naics_codes} onOpenChange={(open) => 
                  setShowHelp(prev => ({ ...prev, naics_codes: open }))
                }>
                  <CollapsibleContent className="space-y-2">
                    <Alert>
                      <AlertDescription className="text-sm">
                        <p className="font-medium mb-2">{FIELD_HELP.naics_codes.help}</p>
                        <p className="text-muted-foreground mb-2">{FIELD_HELP.naics_codes.hint}</p>
                        <div>
                          <p className="font-medium mb-1">Examples:</p>
                          <ul className="text-xs space-y-1">
                            {FIELD_HELP.naics_codes.examples.map((example, index) => (
                              <li key={index} className="text-muted-foreground">• {example}</li>
                            ))}
                          </ul>
                        </div>
                      </AlertDescription>
                    </Alert>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            )}

            {/* PSC Codes */}
            {visibleFields.includes("psc_codes") && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="psc_codes">
                    PSC Codes <span className="text-red-500">*</span>
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleHelp("psc_codes")}
                    className="h-6 px-2 text-xs"
                  >
                    <Icons.help className="h-3 w-3 mr-1" />
                    Help
                  </Button>
                </div>

                <PscSelector
                  value={watch("psc_codes")}
                  onChange={(value) => setValue("psc_codes", value)}
                  placeholder={FIELD_HELP.psc_codes.placeholder}
                  maxSelections={5}
                />
                
                {errors?.psc_codes && (
                  <p className="text-xs text-red-600">{errors.psc_codes.message}</p>
                )}

                <Collapsible open={showHelp.psc_codes} onOpenChange={(open) => 
                  setShowHelp(prev => ({ ...prev, psc_codes: open }))
                }>
                  <CollapsibleContent className="space-y-2">
                    <Alert>
                      <AlertDescription className="text-sm">
                        <p className="font-medium mb-2">{FIELD_HELP.psc_codes.help}</p>
                        <p className="text-muted-foreground mb-2">{FIELD_HELP.psc_codes.hint}</p>
                        <div>
                          <p className="font-medium mb-1">Examples:</p>
                          <ul className="text-xs space-y-1">
                            {FIELD_HELP.psc_codes.examples.map((example, index) => (
                              <li key={index} className="text-muted-foreground">• {example}</li>
                            ))}
                          </ul>
                        </div>
                      </AlertDescription>
                    </Alert>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            )}

            {/* Account Information (Read-only) */}
            {(showAllFields || variant === "full") && (
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
            )}
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <div className="flex items-center text-xs text-muted-foreground">
              {hasUnsavedChanges && (
                <span className="flex items-center gap-1">
                  <Icons.circle className="h-2 w-2 fill-current" />
                  Auto-saving...
                </span>
              )}
            </div>
            
            <Button
              type="submit"
              className="min-w-[120px]"
              disabled={isSaving}
            >
              {isSaving && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              <span>Save Profile</span>
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}