# Spec Tasks

These are the tasks to be completed for the spec detailed in @.agent-os/specs/2025-09-04-user-auth-onboarding/spec.md

> Created: 2025-09-04
> Status: Ready for Implementation

## Tasks

- [ ] 1. Database Schema and Models Setup
  - [ ] 1.1 Write tests for User model extensions
  - [ ] 1.2 Update Prisma schema with new user profile fields
  - [ ] 1.3 Create and run database migration
  - [ ] 1.4 Update User model types and interfaces
  - [ ] 1.5 Verify all tests pass

- [ ] 2. Authentication System Enhancement
  - [ ] 2.1 Write tests for NextAuth configuration
  - [ ] 2.2 Configure GitHub OAuth provider
  - [ ] 2.3 Configure credentials provider for email/password
  - [ ] 2.4 Create signup API endpoint
  - [ ] 2.5 Implement email verification flow
  - [ ] 2.6 Update authentication pages UI
  - [ ] 2.7 Verify all tests pass

- [ ] 3. Profile Management API
  - [ ] 3.1 Write tests for profile API endpoints
  - [ ] 3.2 Create GET /api/user/profile endpoint
  - [ ] 3.3 Create PATCH /api/user/profile endpoint
  - [ ] 3.4 Create GET /api/user/profile-status endpoint
  - [ ] 3.5 Add form validation and error handling
  - [ ] 3.6 Verify all tests pass

- [ ] 4. NAICS Code Integration
  - [ ] 4.1 Write tests for NAICS functionality
  - [ ] 4.2 Create NAICS code data structure/API
  - [ ] 4.3 Build NAICS selection component
  - [ ] 4.4 Create GET /api/naics/search endpoint
  - [ ] 4.5 Add NAICS search and filter functionality
  - [ ] 4.6 Verify all tests pass

- [ ] 5. Progressive Profile UI and User Experience
  - [ ] 5.1 Write tests for profile completion components
  - [ ] 5.2 Create profile completion modal/banner
  - [ ] 5.3 Build company profile form components
  - [ ] 5.4 Implement profile completion prompts
  - [ ] 5.5 Add profile status indicators
  - [ ] 5.6 Create seamless post-auth redirect flows
  - [ ] 5.7 Integrate with existing RFQ browsing functionality
  - [ ] 5.8 Verify all tests pass