# Technical Stack
 
## Stack Summary
 
- App Framework: Python 3.11+
- Backend Framework: FastAPI latest
- Primary Database: PostgreSQL 16+
- JavaScript Framework: React latest
- Build Tool: Vite
- CSS Framework: TailwindCSS 4.0+
- UI Components: Shadcn/ui
- AI Orchestration: LangChain (Python)
- Automation Webhooks: n8n
- Application Hosting: Render (Backend) & Vercel (Frontend)
- Database Hosting: Render Managed PostgreSQL
- CI/CD Platform: GitHub Actions
- Code Repository URL: [To be created]

> Last Updated: 2025-09-03
> Version: 1.0.0

## Application Framework

- **Framework:** FastAPI
- **Version:** ^0.104.0

## Database

- **Primary Database:** PostgreSQL

## JavaScript

- **Framework:** React
- **Build Tool:** Vite
- **Import Strategy:** node

## CSS Framework

- **Framework:** Tailwind CSS
- **Version:** ^3.4.0

## UI Component Library

- **Library:** Shadcn/ui
- **Base:** Radix UI primitives

## Fonts

- **Provider:** Google Fonts
- **Primary:** Inter

## Icons

- **Library:** Lucide React
- **Fallback:** Heroicons

## AI & ML

- **Orchestration:** LangChain
- **Version:** ^0.1.0

## Hosting & Infrastructure

### Application Hosting
- **Platform:** Vercel (Frontend)
- **Backend:** Railway / Render

### Database Hosting
- **Provider:** Neon / Supabase
- **Environment:** Cloud PostgreSQL

### Asset Hosting
- **CDN:** Vercel Edge Network
- **Static Assets:** Built-in Vite asset optimization

### Deployment
- **Solution:** GitHub Actions + Vercel
- **Strategy:** Continuous deployment from main branch

## Development Tools

### Code Repository
- **Platform:** GitHub
- **URL:** To be configured

### Package Management
- **Frontend:** npm/pnpm
- **Backend:** pip + requirements.txt

### Development Environment
- **Frontend:** Vite dev server
- **Backend:** FastAPI with uvicorn
- **Database:** Local PostgreSQL + Docker

## Additional Stack Components

### Authentication
- **Strategy:** JWT tokens
- **Library:** FastAPI-Users or custom implementation

### API Documentation
- **Tool:** FastAPI automatic OpenAPI/Swagger

### Monitoring & Analytics
- **Error Tracking:** To be configured
- **Performance:** Built-in FastAPI metrics

### Testing
- **Frontend:** Vitest + React Testing Library
- **Backend:** pytest + httpx