import { redirect } from "next/navigation"

import { authOptions } from "@/lib/auth"
import { getCurrentUser } from "@/lib/session"
import { checkProfileCompletion } from "@/lib/user"
import { DashboardHeader } from "@/components/header"
import { DashboardShell } from "@/components/shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ProfileProgressBanner } from "@/components/profile-progress-banner"
import { Icons } from "@/components/icons"

// Commented out metadata export to fix structuredClone error
// export const metadata = {
//   title: "RFQs - Browse Opportunities",
//   description: "Browse and search government RFQ opportunities matched to your business profile.",
// }

// Sample RFQ data for demonstration
const sampleRFQs = [
  {
    id: "rfq-001",
    title: "IT Support Services for Federal Agency",
    agency: "Department of Commerce",
    naics: ["541511", "541512"],
    deadline: "2025-10-15",
    value: "$2.5M",
    description: "Comprehensive IT support and maintenance services for multiple federal facilities.",
    location: "Washington, DC",
    status: "Open"
  },
  {
    id: "rfq-002", 
    title: "Construction of Government Building",
    agency: "General Services Administration",
    naics: ["236220", "238210"],
    deadline: "2025-11-30",
    value: "$15M",
    description: "New construction of a 50,000 sq ft government office building.",
    location: "Austin, TX",
    status: "Open"
  },
  {
    id: "rfq-003",
    title: "Cybersecurity Consulting Services",
    agency: "Department of Homeland Security", 
    naics: ["541511", "541690"],
    deadline: "2025-09-20",
    value: "$800K",
    description: "Security assessment and implementation of cybersecurity protocols.",
    location: "Remote",
    status: "Closing Soon"
  }
]

export default async function RFQsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect(authOptions?.pages?.signIn || "/login")
  }

  const profileStatus = checkProfileCompletion(user)
  const userNaicsCodes = user.naics_codes?.split(",") || []
  
  // Filter RFQs based on user's NAICS codes if available
  const matchedRFQs = profileStatus.isComplete 
    ? sampleRFQs.filter(rfq => 
        rfq.naics.some(code => userNaicsCodes.includes(code))
      )
    : []

  return (
    <DashboardShell>
      <DashboardHeader 
        heading="RFQ Opportunities" 
        text="Browse and search government contracting opportunities matched to your business."
      />
      
      {/* Profile Progress Banner - shows contextual RFQ benefits */}
      <ProfileProgressBanner 
        user={user}
        showOnPages={["/rfqs"]}
        className="mb-6"
      />
      

      <div className="space-y-6">
        {/* Enhanced Profile completion benefits messaging */}
        {!profileStatus.isComplete && (
          <div className="space-y-4">
            <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
              <Icons.lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-blue-800 dark:text-blue-200">
                <div className="space-y-3">
                  <div>
                    <strong>🎯 Unlock Personalized Matching:</strong> Complete your profile to see opportunities specifically matched to your NAICS codes and location.
                  </div>
                  <div className="space-y-1 text-sm">
                    <div>• Get 3x more relevant RFQ matches</div>
                    <div>• Access advanced filtering by NAICS, location, and contract value</div>
                    <div>• See match confidence scores for each opportunity</div>
                    <div>• Receive email alerts for high-match opportunities</div>
                  </div>
                  <Button size="sm" className="mt-2">
                    Complete Profile to Unlock
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Enhanced matching results for complete profiles */}
        {profileStatus.isComplete && matchedRFQs.length > 0 && (
          <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
            <Icons.checkCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <strong>🎯 Personalized Results:</strong> Found {matchedRFQs.length} high-confidence opportunities matching your business profile.
                  <div className="mt-1 text-sm opacity-90">
                    Matches based on NAICS codes, location preferences, and contract capabilities.
                  </div>
                </div>
                <Badge className="border-green-300 bg-green-100 text-green-800">
                  <Icons.target className="h-3 w-3 mr-1" />
                  Smart Match
                </Badge>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Empty state for complete profiles with no matches */}
        {profileStatus.isComplete && matchedRFQs.length === 0 && (
          <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
            <Icons.target className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              <div>
                <strong>No Perfect Matches Right Now</strong>
                <div className="mt-1 space-y-1 text-sm">
                  <div>Your profile is complete, but no current opportunities match your NAICS codes.</div>
                  <div className="mt-2 flex items-center gap-4">
                    <Button size="sm" variant="outline">
                      <Icons.settings className="h-3 w-3 mr-1" />
                      Expand NAICS Codes
                    </Button>
                    <Button size="sm" variant="outline">
                      Set Up Email Alerts
                    </Button>
                  </div>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Search and filters */}
        <Card>
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
            <CardDescription>
              {profileStatus.isComplete 
                ? "Advanced filtering available with complete profile"
                : "Complete your profile to unlock advanced search filters"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button variant="outline" disabled={!profileStatus.isComplete}>
                <Icons.filter className="h-4 w-4 mr-2" />
                Filter by NAICS
              </Button>
              <Button variant="outline" disabled={!profileStatus.isComplete}>
                <Icons.map className="h-4 w-4 mr-2" />
                Filter by Location  
              </Button>
              <Button variant="outline" disabled={!profileStatus.isComplete}>
                <Icons.dollar className="h-4 w-4 mr-2" />
                Filter by Value
              </Button>
            </div>
            {!profileStatus.isComplete && (
              <p className="text-sm text-muted-foreground">
                📈 Complete your profile to access personalized search filters and get 3x more relevant matches.
              </p>
            )}
          </CardContent>
        </Card>

        {/* RFQ List */}
        <div className="grid gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {profileStatus.isComplete 
                ? `Available Opportunities (${matchedRFQs.length} matched)` 
                : `Sample Opportunities (${sampleRFQs.length} total)`
              }
            </h2>
          </div>

          {/* Show matched RFQs for complete profiles, sample RFQs for incomplete */}
          {(profileStatus.isComplete ? matchedRFQs : sampleRFQs.slice(0, 2)).map((rfq) => (
            <Card key={rfq.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{rfq.title}</CardTitle>
                    <CardDescription className="flex items-center gap-4">
                      <span>{rfq.agency}</span>
                      <Badge variant="outline">{rfq.value}</Badge>
                      <Badge variant={rfq.status === "Open" ? "default" : "destructive"}>
                        {rfq.status}
                      </Badge>
                    </CardDescription>
                  </div>
                  {profileStatus.isComplete && userNaicsCodes.some(code => rfq.naics.includes(code)) && (
                    <div className="flex items-center gap-2">
                      <Badge className="border-green-300 bg-green-100 text-green-800">
                        <Icons.target className="h-3 w-3 mr-1" />
                        95% Match
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        NAICS Match
                      </Badge>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {rfq.description}
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <Icons.mapPin className="h-3 w-3" />
                    {rfq.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Icons.calendar className="h-3 w-3" />
                    Due: {new Date(rfq.deadline).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Icons.building className="h-3 w-3" />
                    NAICS: {rfq.naics.join(", ")}
                  </span>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button size="sm">View Details</Button>
                  <Button size="sm" variant="outline">Save</Button>
                  {!profileStatus.isComplete && (
                    <Button size="sm" variant="ghost" className="text-orange-600">
                      Complete Profile for Better Matches
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Enhanced encouragement for profile completion */}
          {!profileStatus.isComplete && (
            <Card className="border-dashed border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="text-muted-foreground">
                    <div className="flex items-center justify-center mb-4">
                      <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900">
                        <Icons.lightbulb className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Ready to Find Your Perfect Match?</h3>
                    <div className="mx-auto mt-3 max-w-md space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <p>You&apos;re just a few steps away from unlocking personalized RFQ matching.</p>
                      <div className="rounded-lg bg-white/50 p-3 dark:bg-gray-800/50">
                        <div className="mb-2 text-xs font-medium text-blue-700 dark:text-blue-300">What you&apos;ll get:</div>
                        <div className="space-y-1 text-xs">
                          <div>📊 {sampleRFQs.length - 2}+ additional targeted opportunities</div>
                          <div>🎯 95%+ match confidence scores</div>
                          <div>🔍 Advanced filtering capabilities</div>
                          <div>📧 Smart email alerts for high matches</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center gap-3 sm:flex-row">
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                      <Icons.arrowRight className="h-4 w-4 mr-2" />
                      Complete Profile (2 min)
                    </Button>
                    <Button variant="outline" size="lg">
                      Maybe Later
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardShell>
  )
}