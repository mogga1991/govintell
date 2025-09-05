# Spec Tasks

These are the tasks to be completed for the spec detailed in @.agent-os/specs/2025-09-04-progressive-profile-ui/spec.md

> Created: 2025-09-04
> Status: Ready for Implementation

## Tasks

- [ ] 1. Build Profile Completion Progress Components
  - [ ] 1.1 Write tests for ProfileCompletionCard component
  - [ ] 1.2 Create ProfileCompletionCard with progress indicator and missing fields list
  - [ ] 1.3 Write tests for ProfileProgressBanner component  
  - [ ] 1.4 Create ProfileProgressBanner for contextual prompts across pages
  - [ ] 1.5 Integrate components with existing checkProfileCompletion utility
  - [ ] 1.6 Verify all tests pass

- [ ] 2. Enhance Company Profile Form Components
  - [ ] 2.1 Write tests for enhanced UserProfileForm improvements
  - [ ] 2.2 Add progressive disclosure to existing profile form
  - [ ] 2.3 Implement form state persistence for partial completion
  - [ ] 2.4 Add contextual help text and field descriptions
  - [ ] 2.5 Verify all tests pass

- [ ] 3. Implement Contextual Profile Prompts
  - [ ] 3.1 Write tests for ProfileCompletionPrompt component
  - [ ] 3.2 Create non-blocking modal/toast components for completion prompts
  - [ ] 3.3 Add prompt trigger logic based on user actions and profile status
  - [ ] 3.4 Integrate prompts into dashboard and RFQ browsing flows
  - [ ] 3.5 Verify all tests pass

- [ ] 4. Connect Profile Completion with RFQ Experience
  - [ ] 4.1 Write tests for profile-based filtering hints
  - [ ] 4.2 Add profile completion benefits messaging in RFQ views
  - [ ] 4.3 Show improved matching indicators when profile is complete
  - [ ] 4.4 Add gentle encouragement for profile completion in empty states
  - [ ] 4.5 Verify all tests pass