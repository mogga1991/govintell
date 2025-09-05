import Link from "next/link"

import { env } from "@/env.mjs"
import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

async function getGitHubStars(): Promise<string | null> {
  try {
    const response = await fetch(
      "https://api.github.com/repos/shadcn/taxonomy",
      {
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${env.GITHUB_ACCESS_TOKEN}`,
        },
        next: {
          revalidate: 60,
        },
      }
    )

    if (!response?.ok) {
      return null
    }

    const json = await response.json()

    return parseInt(json["stargazers_count"]).toLocaleString()
  } catch (error) {
    return null
  }
}

export default async function IndexPage() {
  const stars = await getGitHubStars()

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
        <div className="container max-w-6xl mx-auto px-6 text-center">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 mb-12">
            <div className="h-2 w-2 bg-green-500 rounded-full" />
            Trusted by Fortune 500 Government Contractors
          </div>
          
          {/* Main Content */}
          <div className="space-y-12">
            <div className="space-y-6">
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-slate-900 dark:text-white leading-[0.9] tracking-tight">
                Win More<br />Government<br />Contracts
              </h1>
              <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
                Enterprise-grade intelligence platform that increases win rates by 40% and reduces proposal time by 60%
              </p>
            </div>
            
            {/* Key Metrics */}
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold text-slate-900 dark:text-white mb-2">40%</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Higher Win Rate</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-slate-900 dark:text-white mb-2">60%</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Faster Proposals</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-slate-900 dark:text-white mb-2">$2.3M</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Additional Revenue/Quarter</div>
              </div>
            </div>
            
            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/register" 
                className="inline-flex items-center justify-center px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
              >
                Start Free Trial
                <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center px-8 py-4 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                View Pricing
              </Link>
            </div>
          </div>
          
          {/* Client Logos */}
          <div className="mt-24">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">Trusted by industry leaders</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-60">
              <div className="text-lg font-semibold text-slate-600 dark:text-slate-400">Raytheon</div>
              <div className="text-lg font-semibold text-slate-600 dark:text-slate-400">Lockheed Martin</div>
              <div className="text-lg font-semibold text-slate-600 dark:text-slate-400">Booz Allen</div>
              <div className="text-lg font-semibold text-slate-600 dark:text-slate-400">CACI</div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
              Stop Losing to Competitors
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              While you're manually searching for opportunities, competitors are using AI-powered intelligence to win contracts faster.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16">
            {/* Problems */}
            <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Current Challenges</h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Missing opportunities worth $50M+ annually</h4>
                    <p className="text-slate-600 dark:text-slate-400">Contracts published and awarded before discovery</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">60+ hours wasted per proposal</h4>
                    <p className="text-slate-600 dark:text-slate-400">Manual processes that could be automated</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">No competitive intelligence</h4>
                    <p className="text-slate-600 dark:text-slate-400">Flying blind on competitor strategies and pricing</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Solutions */}
            <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Our Solution</h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">AI-powered opportunity detection</h4>
                    <p className="text-slate-600 dark:text-slate-400">Real-time alerts matched to your capabilities</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Automated proposal generation</h4>
                    <p className="text-slate-600 dark:text-slate-400">60% faster with AI-generated content and compliance</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Complete competitive intelligence</h4>
                    <p className="text-slate-600 dark:text-slate-400">Insights on competitors, pricing, and win probability</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Business Outcomes Section */}
      <section className="py-24 bg-white dark:bg-slate-950">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
              Proven Business Results
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Enterprise contractors rely on GovIntelligence to deliver measurable outcomes that impact their bottom line.
            </p>
          </div>

          {/* Value Propositions */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-8">
              <div className="w-12 h-12 bg-slate-900 dark:bg-white rounded-lg flex items-center justify-center mb-6">
                <svg className="h-6 w-6 text-white dark:text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Revenue Growth</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">$2.3M</span> additional revenue per quarter
              </p>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li>• Real-time opportunity alerts</li>
                <li>• Competitive analysis & win scoring</li>
                <li>• Pre-solicitation engagement</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-8">
              <div className="w-12 h-12 bg-slate-900 dark:bg-white rounded-lg flex items-center justify-center mb-6">
                <svg className="h-6 w-6 text-white dark:text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Operational Efficiency</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">60%</span> reduction in proposal time
              </p>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li>• AI-generated proposals</li>
                <li>• Automated compliance checking</li>
                <li>• Team collaboration tools</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-8">
              <div className="w-12 h-12 bg-slate-900 dark:bg-white rounded-lg flex items-center justify-center mb-6">
                <svg className="h-6 w-6 text-white dark:text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Win Rate Improvement</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">40%</span> higher success rate
              </p>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li>• Market intelligence insights</li>
                <li>• Competitor strategy analysis</li>
                <li>• Past performance tracking</li>
              </ul>
            </div>
          </div>

          {/* ROI Calculator */}
          <div className="bg-slate-900 dark:bg-slate-800 rounded-lg p-8 text-center text-white">
            <h3 className="text-2xl font-bold mb-4">ROI Calculator</h3>
            <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
              See the potential revenue impact for your business
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white/10 rounded-lg p-6">
                <div className="text-xl font-bold mb-2">Mid-size Contractor</div>
                <div className="text-2xl font-bold text-yellow-400">+$850K</div>
                <div className="text-sm text-slate-300">annual revenue increase</div>
              </div>
              <div className="bg-white/10 rounded-lg p-6">
                <div className="text-xl font-bold mb-2">Enterprise Client</div>
                <div className="text-2xl font-bold text-blue-400">+$9.2M</div>
                <div className="text-sm text-slate-300">annual revenue increase</div>
              </div>
              <div className="bg-white/10 rounded-lg p-6">
                <div className="text-xl font-bold mb-2">Your Business</div>
                <Link href="/pricing" className="inline-block mt-2 px-4 py-2 bg-white text-slate-900 rounded font-semibold hover:bg-slate-100 transition-colors">
                  Calculate ROI
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Client Success Stories */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
              Trusted by Industry Leaders
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              See how government contractors are transforming their business with GovIntelligence
            </p>
          </div>

          {/* Testimonials */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-8 border border-slate-200 dark:border-slate-700">
              <div className="mb-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="h-4 w-4 fill-yellow-400" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <blockquote className="text-slate-600 dark:text-slate-300 mb-6">
                  "GovIntelligence helped us identify $12M in opportunities we never would have found. Win rate increased from 22% to 34% in 6 months."
                </blockquote>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-900 dark:bg-white rounded-full flex items-center justify-center text-white dark:text-slate-900 font-bold">
                  SM
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">Sarah Martinez</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">VP Business Development</div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg p-8 border border-slate-200 dark:border-slate-700">
              <div className="mb-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="h-4 w-4 fill-yellow-400" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <blockquote className="text-slate-600 dark:text-slate-300 mb-6">
                  "AI proposal assistance cut our response time in half. We can now pursue 3x more opportunities with the same team size."
                </blockquote>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-900 dark:bg-white rounded-full flex items-center justify-center text-white dark:text-slate-900 font-bold">
                  DW
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">David Wilson</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Director of Proposals</div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg p-8 border border-slate-200 dark:border-slate-700">
              <div className="mb-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="h-4 w-4 fill-yellow-400" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <blockquote className="text-slate-600 dark:text-slate-300 mb-6">
                  "Competitive intelligence gave us the edge. We've won 4 major contracts this quarter worth $28M total."
                </blockquote>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-900 dark:bg-white rounded-full flex items-center justify-center text-white dark:text-slate-900 font-bold">
                  LT
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">Lisa Thompson</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">CEO</div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">500+</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Enterprise Clients</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">$2.8B</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Contracts Won</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">99.9%</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Platform Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">24/7</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Enterprise Support</div>
            </div>
          </div>

          {/* Final CTA */}
          <div className="bg-slate-900 dark:bg-slate-800 rounded-lg p-8 text-center text-white">
            <h3 className="text-2xl font-bold mb-4">Ready to Transform Your Business?</h3>
            <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
              Join hundreds of successful government contractors who trust GovIntelligence to grow their revenue.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/register" 
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-slate-900 font-semibold rounded-lg hover:bg-slate-100 transition-colors"
              >
                Start Free Trial
                <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center px-8 py-4 border border-white/20 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
              >
                Schedule Demo
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
