# Database Schema

This is the database schema implementation for the spec detailed in @.agent-os/specs/2025-09-04-user-auth-onboarding/spec.md

## Database Changes Required

### User Model Extensions

**New Columns to Add:**
- `company_name` - VARCHAR(255) NULLABLE - Store user's company/business name
- `naics_codes` - TEXT NULLABLE - Store comma-separated list of primary NAICS codes
- `profile_completed` - BOOLEAN DEFAULT FALSE - Track if user has completed basic business profile
- `business_verified` - BOOLEAN DEFAULT FALSE - Track SAM.gov/business verification status (for future use)

### Prisma Schema Updates

```prisma
model User {
  // Existing fields...
  id               String    @id @default(cuid())
  email            String    @unique
  name             String?
  image            String?
  
  // New fields for contractor profiles
  company_name     String?   @db.VarChar(255)
  naics_codes      String?   @db.Text
  profile_completed Boolean  @default(false)
  business_verified Boolean  @default(false)
  
  // Existing relations...
  accounts         Account[]
  sessions         Session[]
  
  @@map("users")
}
```

### Migration Strategy

**Migration Steps:**
1. Add new optional columns to existing User table
2. Set `profile_completed` to FALSE for all existing users
3. Set `business_verified` to FALSE for all existing users
4. Ensure NULLABLE constraints for `company_name` and `naics_codes` to support existing users

### Indexing Considerations

**Recommended Indexes:**
- Index on `profile_completed` for filtering users by completion status
- Index on `business_verified` for future business verification queries
- Consider partial index on `naics_codes` if NAICS-based filtering becomes performance critical

### Data Integrity Rules

**Validation Rules:**
- `company_name` should be trimmed and non-empty when provided
- `naics_codes` should be validated as comma-separated numeric codes
- `profile_completed` should be automatically set to TRUE when both `company_name` and `naics_codes` are provided
- Email remains required and unique as per existing constraints