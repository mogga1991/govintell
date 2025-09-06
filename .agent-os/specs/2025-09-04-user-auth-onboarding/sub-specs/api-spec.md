# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2025-09-04-user-auth-onboarding/spec.md

## Authentication Endpoints

### POST /api/auth/signup

**Purpose:** Handle credentials-based user registration
**Parameters:** 
- `email` (string, required) - User's email address
- `password` (string, required) - User's password (min 8 characters)
- `name` (string, optional) - User's display name

**Response:** 
- Success: `{ success: true, user: { id, email, name } }`
- Error: `{ error: "message", code: "ERROR_CODE" }`

**Errors:** 
- `EMAIL_EXISTS` - Email already registered
- `WEAK_PASSWORD` - Password doesn't meet requirements
- `INVALID_EMAIL` - Email format invalid

### GET/POST /api/auth/[...nextauth]

**Purpose:** NextAuth.js dynamic route handling GitHub OAuth and credentials signin
**Parameters:** Handled by NextAuth.js providers configuration
**Response:** NextAuth.js standard responses
**Errors:** NextAuth.js standard error handling

## Profile Management Endpoints

### GET /api/user/profile

**Purpose:** Retrieve current user's profile information
**Parameters:** None (uses session)
**Response:** 
```json
{
  "user": {
    "id": "string",
    "email": "string", 
    "name": "string",
    "company_name": "string | null",
    "naics_codes": "string | null",
    "profile_completed": "boolean",
    "business_verified": "boolean"
  }
}
```
**Errors:** `UNAUTHORIZED` - User not authenticated

### PATCH /api/user/profile

**Purpose:** Update user's business profile information
**Parameters:**
- `company_name` (string, optional) - Company/business name
- `naics_codes` (string, optional) - Comma-separated NAICS codes

**Response:** 
```json
{
  "success": true,
  "user": {
    "company_name": "string",
    "naics_codes": "string", 
    "profile_completed": "boolean"
  }
}
```
**Errors:** 
- `UNAUTHORIZED` - User not authenticated
- `INVALID_NAICS` - Invalid NAICS code format
- `COMPANY_NAME_REQUIRED` - Company name cannot be empty

### GET /api/user/profile-status

**Purpose:** Check user's profile completion status for in-app prompts
**Parameters:** None (uses session)
**Response:** 
```json
{
  "profile_completed": "boolean",
  "missing_fields": ["company_name" | "naics_codes"],
  "completion_percentage": "number"
}
```
**Errors:** `UNAUTHORIZED` - User not authenticated

## Utility Endpoints

### GET /api/naics/search

**Purpose:** Search and filter NAICS codes for profile completion
**Parameters:**
- `query` (string, optional) - Search term for NAICS descriptions
- `limit` (number, optional) - Max results to return (default: 20)

**Response:**
```json
{
  "naics_codes": [
    {
      "code": "541511",
      "title": "Custom Computer Programming Services",
      "description": "..."
    }
  ]
}
```
**Errors:** `INVALID_QUERY` - Query parameter invalid