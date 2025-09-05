# HTML Style Guide

## Structure Rules
- Use 2 spaces for indentation
- Place nested elements on new lines with proper indentation
- Content between tags should be on its own line when multi-line

## Attribute Formatting
- Place each HTML attribute on its own line
- Align attributes vertically
- Keep the closing `>` on the same line as the last attribute

## Example HTML Structure

```html
<div class="container">
  <header class="flex flex-col space-y-2
                 md:flex-row md:space-y-0 md:space-x-4">
    <h1 class="text-primary dark:text-primary-300">
      Page Title
    </h1>
    <nav class="flex flex-col space-y-2
                md:flex-row md:space-y-0 md:space-x-4">
      <a href="/"
         class="btn-ghost">
        Home
      </a>
      <a href="/about"
         class="btn-ghost">
        About
      </a>
    </nav>
  </header>
</div>
```

## 🔧 Essential NextAuth Type Setup

### 1. **Proper Type Augmentation Pattern**
Always extend the base NextAuth types, never replace them:

```typescript
// ✅ CORRECT - types/next-auth.d.ts
import NextAuth, { DefaultSession, DefaultUser } from "next-auth"
import { JWT as BaseJWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      // your custom fields here
    } & DefaultSession["user"]  // ← KEY: Extend, don't replace
  }

  interface User extends DefaultUser {  // ← KEY: Extend DefaultUser
    // your custom fields here
  }
}

declare module "next-auth/jwt" {
  interface JWT extends BaseJWT {  // ← KEY: Extend BaseJWT
    id: string
    // your custom fields here
  }
}
```

### 2. **JWT Callback Pattern**
Always mutate the existing token, never return a new object:

```typescript
// ✅ CORRECT
async jwt({ token, user }) {
  if (user) {
    // On sign-in, add user data to token
    token.id = user.id
    token.custom_field = user.custom_field
  } else {
    // For existing sessions, optionally refresh from DB
    const dbUser = await db.user.findFirst({ where: { email: token.email }})
    if (dbUser) {
      token.id = dbUser.id
      token.custom_field = dbUser.custom_field
    }
  }
  return token  // ← Always return the mutated token
}

// ❌ WRONG - Don't do this
async jwt({ token, user }) {
  if (user) {
    return {  // ← This breaks NextAuth's internal JWT structure
      id: user.id,
      custom_field: user.custom_field
    }
  }
  return token
}
```

### 3. **TypeScript Configuration Requirements**
Your `tsconfig.json` needs these settings for NextAuth compatibility:

```json
{
  "compilerOptions": {
    "target": "ES2017",           // ← Minimum for NextAuth
    "esModuleInterop": true,      // ← Required for module imports
    "allowSyntheticDefaultImports": true,  // ← Helps with imports
    "isolatedModules": true,      // ← Required by Next.js
    "strictNullChecks": true      // ← Recommended for type safety
  },
  "include": [
    "types/next-auth.d.ts"        // ← Ensure your types are included
  ],
  "exclude": [
    "vitest.config.ts",           // ← Exclude test configs from build
    "test-setup.ts"
  ]
}
```

## 🚨 Common Pitfalls to Avoid

### 1. **Don't Replace Base Types**
```typescript
// ❌ WRONG
declare module "next-auth/jwt" {
  interface JWT {  // ← Missing "extends BaseJWT"
    id: string
    custom_field: string
  }
}
```

### 2. **Don't Return New Objects in JWT Callback**
```typescript
<code_block_to_apply_changes_from>
```

### 3. **Don't Forget Required Fields**
Make sure your custom User interface includes all fields you use:
```typescript
// ✅ CORRECT
interface User extends DefaultUser {
  profile_completed: boolean     // ← Required if used in your app
  business_verified: boolean     // ← Required if used in your app
}
```

## 📋 Quick Checklist

Before deploying NextAuth changes:

- [ ] Type declarations extend base types (don't replace them)
- [ ] JWT callback mutates `token` object (doesn't return new object)
- [ ] All custom fields are declared in type modules
- [ ] `tsconfig.json` includes your type files
- [ ] Build passes: `npm run build`
- [ ] No TypeScript errors: `npx tsc --noEmit`

## 🎯 Key Principle

**NextAuth expects to manage the core JWT structure.** Your job is to add your custom data to it, not replace it. The framework needs internal fields like `sub`, `iat`, `exp` for security and session management.

Following this pattern will prevent the `JWT | { ... }` union type errors and ensure your authentication works reliably!
