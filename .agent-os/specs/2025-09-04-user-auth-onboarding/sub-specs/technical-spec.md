# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-09-04-user-auth-onboarding/spec.md

## Technical Requirements

- **NextAuth.js Configuration** - Extend existing NextAuth setup to support both GitHub OAuth and credentials (email/password) providers
- **Database Schema Updates** - Add company_name and naics_codes fields to User model in Prisma schema with optional constraints
- **Authentication Pages** - Create sign-in and sign-up pages using shadcn/ui components with provider selection interface
- **Session Management** - Implement proper session handling with user profile completion status tracking
- **Progressive Profile UI** - Build in-app modal/banner components for company profile completion prompts
- **Profile Completion API** - Create API routes for updating user profile information (company name, NAICS codes)
- **NAICS Code Integration** - Implement NAICS code selection component with search/filter functionality
- **Profile Status Indicators** - Add profile completion percentage and status indicators in user interface
- **Route Protection** - Ensure authenticated routes work with both OAuth and credentials authentication
- **Form Validation** - Implement proper form validation for email/password signup and profile completion
- **User Experience Flow** - Create seamless redirect flows from authentication to RFQ browsing with contextual profile prompts
- **Email Verification** - Add email verification for credentials-based signups using NextAuth built-in functionality