## Architectural Principles

- **Server-First**: Leverage React Server Components (RSCs) for data fetching and backend logic wherever possible. Client Components (`'use client'`) should only be used for interactivity.
- **API Routes**: Use Next.js API Routes (`app/api/...`) for backend logic that needs to be called from the client, such as form submissions or orchestrating AI agents.
- **Type Safety is Paramount**: All code must be strongly typed. Use Zod for runtime validation of API inputs and environment variables.

## Database Logic

- All database queries via Prisma **must** occur on the server (in Server Components or API Routes). Never expose your Prisma client to the browser.
- The schema (`prisma/schema.prisma`) is the single source of truth for the database.
- The `relationMode` must be set to `"prisma"`.
- After any schema change, the database must be synced by running `n-px prisma db push`.

## Environment Variables

- Access all environment variables through the validated `env.mjs` file to ensure type safety.