"use client"

import { DashboardShell } from "@/components/shell"
import { DashboardHeader } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Icons } from "@/components/icons"

export default function DocumentationPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Documentation"
        text="Learn how to use GovIntelligence to find and manage RFQ opportunities"
      />
      
      <div className="grid gap-6">
        {/* Quick Start Guide */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.rocket className="h-5 w-5" />
              Quick Start Guide
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Badge className="mt-1">1</Badge>
                <div>
                  <h4 className="font-medium">Browse RFQ Opportunities</h4>
                  <p className="text-sm text-muted-foreground">
                    Navigate to "RFQ Opportunities" in the sidebar to see available government contracts and solicitations.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Badge className="mt-1">2</Badge>
                <div>
                  <h4 className="font-medium">Save Interesting Opportunities</h4>
                  <p className="text-sm text-muted-foreground">
                    Click the bookmark icon on any RFQ card to save it to your collection for later review.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Badge className="mt-1">3</Badge>
                <div>
                  <h4 className="font-medium">View Detailed Information</h4>
                  <p className="text-sm text-muted-foreground">
                    Click "View Details" on any RFQ to see comprehensive information including requirements, deadlines, and contact details.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Badge className="mt-1">4</Badge>
                <div>
                  <h4 className="font-medium">Find Products</h4>
                  <p className="text-sm text-muted-foreground">
                    Use the "Find Products" button on RFQ detail pages to research relevant products and solutions for each opportunity.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.list className="h-5 w-5" />
              Platform Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Icons.search className="h-4 w-4 text-blue-600" />
                  <h4 className="font-medium">RFQ Discovery</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Browse and search through government RFQ opportunities with advanced filtering capabilities.
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Icons.bookmark className="h-4 w-4 text-green-600" />
                  <h4 className="font-medium">Save & Organize</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Save interesting opportunities and organize them in your personal collection.
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Icons.clipboard className="h-4 w-4 text-purple-600" />
                  <h4 className="font-medium">Detailed Analysis</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  View comprehensive details including contract values, deadlines, and requirements.
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Icons.send className="h-4 w-4 text-orange-600" />
                  <h4 className="font-medium">Product Research</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Research relevant products and solutions for each RFQ opportunity.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Understanding RFQ Cards */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.info className="h-5 w-5" />
              Understanding RFQ Cards
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <h4 className="font-medium mb-2">Card Information</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• <strong>Title:</strong> The official name of the solicitation</li>
                  <li>• <strong>Agency:</strong> The government agency issuing the RFQ</li>
                  <li>• <strong>Contract Value:</strong> Estimated value range for the contract</li>
                  <li>• <strong>Due Date:</strong> Response deadline for the solicitation</li>
                  <li>• <strong>Status:</strong> Current status of the opportunity (Open, Closed, etc.)</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Available Actions</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• <strong>Save:</strong> Add to your personal collection</li>
                  <li>• <strong>View Details:</strong> See comprehensive information</li>
                  <li>• <strong>Find Products:</strong> Research relevant solutions</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Guide */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.map className="h-5 w-5" />
              Navigation Guide
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Sidebar Navigation</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• <strong>Dashboard:</strong> Overview and quick access to key features</li>
                  <li>• <strong>RFQ Opportunities:</strong> Browse and search all available opportunities</li>
                  <li>• <strong>Billing:</strong> Manage your subscription and billing information</li>
                  <li>• <strong>Settings:</strong> Update your profile and preferences</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Header Navigation</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• <strong>Documentation:</strong> This help page with guides and tutorials</li>
                  <li>• <strong>Support:</strong> Get help and contact customer support</li>
                  <li>• <strong>Account Menu:</strong> Access account settings and logout</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
