# Development Best Practices

## Context

Global development guidelines for Agent OS projects.

<conditional-block context-check="core-principles">
IF this Core Principles section already read in current context:
  SKIP: Re-reading this section
  NOTE: "Using Core Principles already in context"
ELSE:
  READ: The following principles

## Core Principles

### Keep It Simple
- Implement code in the fewest lines possible
- Avoid over-engineering solutions
- Choose straightforward approaches over clever ones

### Optimize for Readability
- Prioritize code clarity over micro-optimizations
- Write self-documenting code with clear variable names
- Add comments for "why" not "what"

### DRY (Don't Repeat Yourself)
- Extract repeated business logic to private methods
- Extract repeated UI markup to reusable components
- Create utility functions for common operations

### File Structure
- Keep files focused on a single responsibility
- Group related functionality together
- Use consistent naming conventions
</conditional-block>

## Project-Specific Principles

### MVP First
- Every feature must directly contribute to the core workflow: Find RFQ -> Analyze -> Source Product -> Generate Quote.
- Defer all non-essential features (e.g., user accounts, advanced analytics) until after the MVP is validated.

### AI Model Fallbacks
- When integrating with AI APIs (Gemini, Claude, Deepseek, Perplexity), the system must be designed with a fallback chain.
- If the primary model fails or returns a poor response, the system should automatically retry with the next best model in the predefined sequence.

### Modularity
- The backend should be organized into distinct modules (e.g., `importers`, `analysis`, `sourcing`, `quotes`). Each module should have a single responsibility.

<conditional-block context-check="dependencies" task-condition="choosing-external-library">
IF current task involves choosing an external library:
  IF Dependencies section already read in current context:
    SKIP: Re-reading this section
    NOTE: "Using Dependencies guidelines already in context"
  ELSE:
    READ: The following guidelines
ELSE:
  SKIP: Dependencies section not relevant to current task

## Dependencies

### Choose Libraries Wisely
When adding third-party dependencies:
- Select the most popular and actively maintained option
- Check the library's GitHub repository for:
  - Recent commits (within last 6 months)
  - Active issue resolution
  - Number of stars/downloads
  - Clear documentation
</conditional-block>
