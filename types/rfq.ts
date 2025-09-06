import { Decimal } from "@prisma/client/runtime/library"

// Base RFQ interface
export interface Rfq {
  id: string
  title: string
  description: string
  agency: string
  naics_codes: string
  psc_codes: string | null
  location: string
  state: string | null
  city: string | null
  contract_value_min: Decimal | null
  contract_value_max: Decimal | null
  contract_type: string | null
  set_aside_type: string | null
  posted_date: Date
  deadline_date: Date
  response_date: Date | null
  status: string
  solicitation_number: string
  source_url: string | null
  source_system: string | null
  createdAt: Date
  updatedAt: Date
}

// RFQ with relationships
export interface RfqWithRelations extends Rfq {
  savedBy?: SavedRfq[]
  statusTracking?: RfqStatus[]
  matchScore?: RfqMatchScore | null
  isSaved?: boolean
  userStatus?: RfqStatus | null
}

// Saved RFQ interface
export interface SavedRfq {
  id: string
  userId: string
  rfqId: string
  folder: string | null
  notes: string | null
  priority: string | null
  createdAt: Date
  updatedAt: Date
  rfq?: Rfq
}

// RFQ Status interface
export interface RfqStatus {
  id: string
  userId: string
  rfqId: string
  status: RfqStatusType
  applied_date: Date | null
  submission_date: Date | null
  award_date: Date | null
  contract_value: Decimal | null
  notes: string | null
  confidence_score: number | null
  createdAt: Date
  updatedAt: Date
  rfq?: Rfq
}

// RFQ Match Score interface
export interface RfqMatchScore {
  id: string
  userId: string
  rfqId: string
  overall_score: number
  naics_score: number
  psc_score: number | null
  location_score: number
  value_score: number
  experience_score: number
  matching_naics: string | null
  matching_psc: string | null
  score_breakdown: string | null
  createdAt: Date
  updatedAt: Date
}

// User Alert Config interface
export interface UserAlertConfig {
  id: string
  userId: string
  enabled: boolean
  email_enabled: boolean
  min_match_score: number
  max_contract_value: Decimal | null
  min_contract_value: Decimal | null
  preferred_states: string | null
  include_remote: boolean
  alert_frequency: AlertFrequency
  digest_day: number | null
  digest_time: number | null
  createdAt: Date
  updatedAt: Date
}

// Enums and types
export type RfqStatusType = 
  | "watched" 
  | "applied" 
  | "submitted" 
  | "won" 
  | "lost" 
  | "no_bid"

export type AlertFrequency = 
  | "realtime" 
  | "daily" 
  | "weekly"

export type RfqPriority = 
  | "High" 
  | "Medium" 
  | "Low"

export type ContractType = 
  | "FFP"        // Firm Fixed Price
  | "T&M"        // Time and Materials
  | "Cost Plus"  // Cost Plus
  | "IDIQ"       // Indefinite Delivery/Indefinite Quantity
  | "GSA"        // General Services Administration
  | "BPA"        // Blanket Purchase Agreement

export type SetAsideType = 
  | "Small Business"
  | "8(a)"
  | "HUBZone"
  | "WOSB"       // Women-Owned Small Business
  | "VOSB"       // Veteran-Owned Small Business
  | "SDVOSB"     // Service-Disabled Veteran-Owned Small Business

// Search and filter types
export interface RfqSearchFilters {
  keyword?: string
  naics_codes?: string[]
  psc_codes?: string[]
  states?: string[]
  agencies?: string[]
  contract_value_min?: number
  contract_value_max?: number
  contract_types?: ContractType[]
  set_aside_types?: SetAsideType[]
  deadline_from?: Date
  deadline_to?: Date
  posted_from?: Date
  posted_to?: Date
  status?: string[]
  min_match_score?: number
  saved_only?: boolean
  user_status?: RfqStatusType[]
}

export interface RfqSearchResult {
  rfqs: RfqWithRelations[]
  total: number
  page: number
  limit: number
  filters: RfqSearchFilters
  facets: {
    agencies: { name: string; count: number }[]
    states: { code: string; count: number }[]
    contract_types: { type: string; count: number }[]
    set_aside_types: { type: string; count: number }[]
  }
}

// Form data types for API requests
export interface CreateRfqData {
  title: string
  description: string
  agency: string
  naics_codes: string
  psc_codes?: string
  location: string
  state?: string
  city?: string
  contract_value_min?: number
  contract_value_max?: number
  contract_type?: string
  set_aside_type?: string
  posted_date: string
  deadline_date: string
  response_date?: string
  solicitation_number: string
  source_url?: string
  source_system?: string
}

export interface UpdateSavedRfqData {
  folder?: string
  notes?: string
  priority?: RfqPriority
}

export interface UpdateRfqStatusData {
  status: RfqStatusType
  applied_date?: string
  submission_date?: string
  award_date?: string
  contract_value?: number
  notes?: string
  confidence_score?: number
}

export interface UpdateUserAlertConfigData {
  enabled?: boolean
  email_enabled?: boolean
  min_match_score?: number
  max_contract_value?: number
  min_contract_value?: number
  preferred_states?: string
  include_remote?: boolean
  alert_frequency?: AlertFrequency
  digest_day?: number
  digest_time?: number
}

// Calculated/derived types
export interface RfqMatchBreakdown {
  overall_score: number
  factors: {
    naics_match: {
      score: number
      matched_codes: string[]
      total_codes: number
    }
    psc_match: {
      score: number
      matched_codes: string[]
      total_codes: number
    } | null
    location_match: {
      score: number
      distance?: number
      preference_match: boolean
    }
    value_match: {
      score: number
      in_range: boolean
      company_capacity: "under" | "suitable" | "over"
    }
    experience_match: {
      score: number
      similar_contracts: number
      recent_work: boolean
    }
  }
  recommendations: string[]
}

// Dashboard analytics types
export interface RfqPipelineStats {
  watched: number
  applied: number
  submitted: number
  won: number
  lost: number
  total_value_applied: number
  total_value_won: number
  win_rate: number
  avg_confidence: number
}

export interface RfqTrendData {
  period: string
  new_rfqs: number
  matched_rfqs: number
  applications: number
  wins: number
  avg_match_score: number
}