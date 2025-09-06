import * as z from "zod"

export const userNameSchema = z.object({
  name: z.string().min(3).max(32),
})

// Profile validation schemas
export const userProfileUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name is too long").optional(),
  company_name: z.string().min(1, "Company name is required").max(255, "Company name is too long").optional(),
  naics_codes: z.string()
    .refine(
      (codes) => {
        if (!codes) return true // Allow empty for optional updates
        const codesArray = codes.split(",")
        return codesArray.every(code => code.trim().match(/^\d{6}$/))
      },
      {
        message: "NAICS codes must be 6-digit numbers separated by commas"
      }
    )
    .optional(),
  psc_codes: z.string()
    .refine(
      (codes) => {
        if (!codes) return true // Allow empty for optional updates
        const codesArray = codes.split(",")
        return codesArray.every(code => code.trim().match(/^[A-Z0-9]{4}$/))
      },
      {
        message: "PSC codes must be 4-character alphanumeric codes separated by commas"
      }
    )
    .optional(),
})

export const userProfileFormSchema = z.object({
  company_name: z.string().min(1, "Company name is required").max(255, "Company name is too long"),
  naics_codes: z.string()
    .min(1, "At least one NAICS code is required")
    .refine(
      (codes) => {
        const codesArray = codes.split(",")
        return codesArray.every(code => code.trim().match(/^\d{6}$/))
      },
      {
        message: "NAICS codes must be 6-digit numbers separated by commas"
      }
    ),
  psc_codes: z.string()
    .min(1, "At least one PSC code is required")
    .refine(
      (codes) => {
        const codesArray = codes.split(",")
        return codesArray.every(code => code.trim().match(/^[A-Z0-9]{4}$/))
      },
      {
        message: "PSC codes must be 4-character alphanumeric codes separated by commas"
      }
    ),
})

// NAICS code validation
export const naicsCodeSchema = z.object({
  code: z.string().regex(/^\d{6}$/, "NAICS code must be exactly 6 digits"),
  title: z.string().min(1, "NAICS title is required"),
  description: z.string().optional(),
})

// PSC code validation
export const pscCodeSchema = z.object({
  code: z.string().regex(/^[A-Z0-9]{4}$/, "PSC code must be exactly 4 alphanumeric characters"),
  title: z.string().min(1, "PSC title is required"),
  description: z.string().optional(),
  category: z.string().optional(),
})
