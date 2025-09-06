"use client"

import { DashboardShell } from "@/components/shell"
import { DashboardHeader } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Icons } from "@/components/icons"

export default function SupportPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Support"
        text="Get help with GovIntelligence and find answers to common questions"
      />
      
      <div className="grid gap-6">
        {/* Contact Support */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.helpCircle className="h-5 w-5" />
              Contact Support
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Need help? Our support team is here to assist you with any questions or issues.
            </p>
            
            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Icons.mail className="h-5 w-5 text-blue-600" />
                <div>
                  <h4 className="font-medium">Email Support</h4>
                  <p className="text-sm text-muted-foreground">support@govintelligence.com</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Icons.clock className="h-5 w-5 text-green-600" />
                <div>
                  <h4 className="font-medium">Response Time</h4>
                  <p className="text-sm text-muted-foreground">Within 24 hours</p>
                </div>
              </div>
            </div>
            
            <Button className="w-full md:w-auto">
              <Icons.mail className="h-4 w-4 mr-2" />
              Send Support Email
            </Button>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.info className="h-5 w-5" />
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-medium">How do I save RFQ opportunities?</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Click the bookmark icon on any RFQ card to save it to your collection. You can view all saved opportunities in your dashboard.
                </p>
              </div>
              
              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-medium">How does the product research feature work?</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Click "Find Products" on any RFQ detail page to research relevant products and solutions. The system analyzes the requirements and suggests matching products.
                </p>
              </div>
              
              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-medium">How often are new RFQs added?</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Our system continuously monitors government sources and adds new opportunities daily. Check back regularly for the latest listings.
                </p>
              </div>
              
              <div className="border-l-4 border-orange-500 pl-4">
                <h4 className="font-medium">Can I filter RFQs by specific criteria?</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Yes, you can filter opportunities by agency, contract value, status, and other criteria using the search and filter options.
                </p>
              </div>
              
              <div className="border-l-4 border-red-500 pl-4">
                <h4 className="font-medium">What if I encounter a technical issue?</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  If you experience any technical problems, please contact our support team with details about the issue and we'll help resolve it quickly.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Getting Started */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.rocket className="h-5 w-5" />
              Getting Started Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <Icons.file className="h-5 w-5 mt-1 text-blue-600" />
                <div>
                  <h4 className="font-medium">Documentation</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Complete guides and tutorials for using the platform
                  </p>
                  <Button variant="outline" size="sm">
                    View Docs
                  </Button>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <Icons.video className="h-5 w-5 mt-1 text-green-600" />
                <div>
                  <h4 className="font-medium">Video Tutorials</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Step-by-step video guides (coming soon)
                  </p>
                  <Button variant="outline" size="sm" disabled>
                    Coming Soon
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account & Billing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.settings className="h-5 w-5" />
              Account & Billing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <h4 className="font-medium mb-2">Account Settings</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Update your profile information and preferences
                </p>
                <Button variant="outline" size="sm">
                  <Icons.user className="h-4 w-4 mr-2" />
                  Account Settings
                </Button>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Billing Information</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Manage your subscription and payment details
                </p>
                <Button variant="outline" size="sm">
                  <Icons.creditCard className="h-4 w-4 mr-2" />
                  Billing Settings
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status & Updates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.activity className="h-5 w-5" />
              Platform Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <div>
                <h4 className="font-medium text-green-800">All Systems Operational</h4>
                <p className="text-sm text-green-600">Platform is running smoothly</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
