# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-09-04-progressive-profile-ui/spec.md

> Created: 2025-09-04
> Version: 1.0.0

## Technical Requirements

### React Components Architecture

#### 1. Profile Form Components
- **ProfileCompletionModal**: Modal component for profile completion prompts
  - Built using shadcn/ui Dialog component
  - Triggered by profile completion status checks
  - Non-blocking with dismissal capability
- **ProfileProgressIndicator**: Visual progress component
  - Utilizes existing Progress component from shadcn/ui
  - Shows percentage completion with visual feedback
  - Displays in dashboard header and settings page
- **QuickProfileForm**: Lightweight profile editing form
  - Embedded version of existing user-profile-form.tsx
  - Contextual field selection based on missing data
  - Inline validation with real-time feedback

#### 2. Integration Points with Existing Systems
- **User Profile System**: Extend existing user-profile-form.tsx component
  - Integrate with current form validation patterns
  - Maintain compatibility with existing user update API endpoints
  - Use established TypeScript interfaces from lib/validations/user.ts
- **NAICS Selector Integration**: Connect with existing naics-selector.tsx
  - Implement progressive disclosure for industry selection
  - Maintain existing search and selection functionality
  - Integrate completion status with NAICS data requirements
- **Dashboard Integration**: Embed progress indicators in dashboard layout
  - Use existing dashboard page structure
  - Maintain responsive design patterns
  - Follow established component composition patterns

### UI/UX Specifications

#### 3. Contextual Prompt System
- **Trigger Logic**: Based on profile completion percentage and user actions
  - Show prompts when completion < 70% and user accesses key features
  - Implement smart timing to avoid interrupting critical workflows
  - Use session storage to manage prompt frequency
- **Prompt Types**:
  - Toast notifications for gentle reminders (using existing toast system)
  - Modal dialogs for important profile gaps
  - Inline suggestions within forms
- **Dismissal Patterns**: 
  - Temporary dismissal (session-based)
  - Permanent dismissal with user preference storage
  - Smart re-engagement based on user behavior

#### 4. Responsive Design Requirements
- **Mobile-First Approach**: Follow existing Tailwind CSS patterns
  - Responsive breakpoints: sm, md, lg, xl
  - Touch-friendly interaction areas (44px minimum)
  - Optimized modal sizing for mobile screens
- **Desktop Enhancements**: 
  - Sidebar progress indicators
  - Hover states for interactive elements
  - Keyboard navigation support

### TypeScript Interfaces and Validation

#### 5. Type Definitions
```typescript
interface ProfileCompletionStatus {
  percentage: number;
  missingFields: string[];
  completedSections: ProfileSection[];
  nextRecommendedAction: string;
}

interface ProfilePromptConfig {
  type: 'modal' | 'toast' | 'inline';
  priority: 'low' | 'medium' | 'high';
  dismissible: boolean;
  frequency: 'once' | 'session' | 'recurring';
}

interface ProfileProgressData {
  basicInfo: boolean;
  companyDetails: boolean;
  naicsCode: boolean;
  contactInfo: boolean;
  preferences: boolean;
}
```

#### 6. Validation Requirements
- **Form Validation**: Extend existing Zod schemas from lib/validations/user.ts
  - Add progressive validation rules
  - Implement conditional field requirements
  - Maintain type safety with TypeScript inference
- **Completion Logic**: Enhance existing checkProfileCompletion utility
  - Add weighted completion scoring
  - Implement priority-based field requirements
  - Support configurable completion criteria

### Integration with Existing Profile System

#### 7. API Integration
- **Existing Endpoints**: Utilize current user API routes in app/api/user/
  - GET /api/user/profile for profile data retrieval
  - PATCH /api/user/profile for progressive updates
  - POST /api/user/completion-status for status tracking
- **Database Integration**: Work with existing user schema
  - No database schema changes required
  - Use existing user profile fields
  - Implement completion tracking in application layer

#### 8. State Management
- **React State Patterns**: Follow existing patterns from user-profile-form.tsx
  - Use react-hook-form for form state management
  - Implement optimistic UI updates
  - Handle loading and error states consistently
- **Client-Side Persistence**: 
  - Session storage for prompt dismissal states
  - Local storage for user preferences
  - Cache profile completion status

## Approach

### Implementation Strategy
1. **Phase 1**: Create core progress tracking components
2. **Phase 2**: Implement contextual prompt system
3. **Phase 3**: Integrate with existing dashboard and settings
4. **Phase 4**: Add advanced features (smart prompting, analytics)

### Development Patterns
- **Component Composition**: Build small, reusable components
- **Hook-Based Logic**: Extract business logic into custom React hooks
- **Progressive Enhancement**: Start with basic functionality, add advanced features
- **Testing Strategy**: Unit tests for components, integration tests for user flows

## External Dependencies

**No new external dependencies required.** All functionality will be built using the existing tech stack:

- **Frontend Framework**: Next.js 14 with React 18
- **UI Components**: shadcn/ui component library
- **Styling**: Tailwind CSS with existing design system
- **Form Handling**: react-hook-form (already in use)
- **Validation**: Zod schemas (existing validation patterns)
- **TypeScript**: For type safety and developer experience
- **State Management**: React built-in state management patterns

The implementation will leverage existing components, utilities, and patterns to maintain consistency with the current codebase while adding the progressive profile completion functionality.