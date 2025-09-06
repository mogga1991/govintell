"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { cn } from "@/lib/utils"
import { RfqSearchFilters } from "@/types/rfq"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Icons } from "@/components/icons"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

// Form validation schema
const filtersSchema = z.object({
  keyword: z.string().optional(),
  naics_codes: z.array(z.string()).optional(),
  psc_codes: z.array(z.string()).optional(),
  states: z.array(z.string()).optional(),
  agencies: z.array(z.string()).optional(),
  contract_value_min: z.string().optional(),
  contract_value_max: z.string().optional(),
  contract_types: z.array(z.string()).optional(),
  set_aside_types: z.array(z.string()).optional(),
  deadline_from: z.string().optional(),
  deadline_to: z.string().optional(),
  status: z.array(z.string()).default(['Open']),
  saved_only: z.boolean().default(false),
})

type FormData = z.infer<typeof filtersSchema>

interface RfqSearchFiltersProps {
  currentFilters: RfqSearchFilters
  facets: {
    agencies: { name: string; count: number }[]
    states: { code: string; count: number }[]
    contract_types: { type: string; count: number }[]
    set_aside_types: { type: string; count: number }[]
  }
  onFiltersChange: (filters: RfqSearchFilters) => void
  className?: string
}

// State codes mapping for display
const US_STATES = {
  'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas',
  'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware',
  'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho',
  'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas',
  'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
  'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi',
  'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada',
  'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York',
  'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma',
  'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
  'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah',
  'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia',
  'WI': 'Wisconsin', 'WY': 'Wyoming', 'DC': 'District of Columbia'
}

export function RfqSearchFilters({ 
  currentFilters, 
  facets, 
  onFiltersChange, 
  className 
}: RfqSearchFiltersProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({
    location: false,
    contract: false,
    dates: false,
    advanced: false
  })

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { isDirty }
  } = useForm<FormData>({
    resolver: zodResolver(filtersSchema),
    defaultValues: {
      keyword: currentFilters.keyword || "",
      naics_codes: currentFilters.naics_codes || [],
      psc_codes: currentFilters.psc_codes || [],
      states: currentFilters.states || [],
      agencies: currentFilters.agencies || [],
      contract_value_min: currentFilters.contract_value_min?.toString() || "",
      contract_value_max: currentFilters.contract_value_max?.toString() || "",
      contract_types: currentFilters.contract_types || [],
      set_aside_types: currentFilters.set_aside_types || [],
      deadline_from: currentFilters.deadline_from ? (typeof currentFilters.deadline_from === 'string' ? currentFilters.deadline_from : currentFilters.deadline_from.toISOString().split('T')[0]) : "",
      deadline_to: currentFilters.deadline_to ? (typeof currentFilters.deadline_to === 'string' ? currentFilters.deadline_to : currentFilters.deadline_to.toISOString().split('T')[0]) : "",
      status: currentFilters.status || ['Open'],
      saved_only: currentFilters.saved_only || false,
    }
  })

  const watchedValues = watch()

  function onSubmit(data: FormData) {
    const filters: RfqSearchFilters = {
      ...data,
      contract_value_min: data.contract_value_min ? Number(data.contract_value_min) : undefined,
      contract_value_max: data.contract_value_max ? Number(data.contract_value_max) : undefined,
      deadline_from: data.deadline_from ? new Date(data.deadline_from) : undefined,
      deadline_to: data.deadline_to ? new Date(data.deadline_to) : undefined,
      contract_types: data.contract_types as any,
      set_aside_types: data.set_aside_types as any,
    }
    
    onFiltersChange(filters)
    setIsOpen(false)
  }

  function clearFilters() {
    reset({
      keyword: "",
      naics_codes: [],
      psc_codes: [],
      states: [],
      agencies: [],
      contract_value_min: "",
      contract_value_max: "",
      contract_types: [],
      set_aside_types: [],
      deadline_from: "",
      deadline_to: "",
      status: ['Open'],
      saved_only: false,
    })
  }

  function toggleSection(section: string) {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  function toggleArrayValue(field: keyof FormData, value: string) {
    const currentValues = watchedValues[field] as string[] || []
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value]
    setValue(field, newValues, { shouldDirty: true })
  }

  // Count active filters
  const activeFilterCount = React.useMemo(() => {
    let count = 0
    if (currentFilters.keyword) count++
    if (currentFilters.naics_codes?.length) count++
    if (currentFilters.psc_codes?.length) count++
    if (currentFilters.states?.length) count++
    if (currentFilters.agencies?.length) count++
    if (currentFilters.contract_value_min || currentFilters.contract_value_max) count++
    if (currentFilters.contract_types?.length) count++
    if (currentFilters.set_aside_types?.length) count++
    if (currentFilters.deadline_from || currentFilters.deadline_to) count++
    if (currentFilters.saved_only) count++
    if (currentFilters.status && !currentFilters.status.includes('Open')) count++
    return count
  }, [currentFilters])

  return (
    <div className={cn("space-y-4", className)}>
      {/* Quick Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Icons.search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search RFQs by keyword, agency, or solicitation number..."
            className="pl-10"
            {...register("keyword")}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleSubmit(onSubmit)()
              }
            }}
          />
        </div>
        <Button type="button" onClick={handleSubmit(onSubmit)}>
          Search
        </Button>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="relative">
              <Icons.filter className="h-4 w-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge 
                  variant="secondary" 
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                >
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
            <form onSubmit={handleSubmit(onSubmit)}>
              <SheetHeader>
                <SheetTitle>Filter RFQ Opportunities</SheetTitle>
                <SheetDescription>
                  Refine your search to find the most relevant government contracting opportunities.
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6 py-6">
                {/* Status Filter */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="flex flex-wrap gap-2">
                    {['Open', 'Closing Soon', 'Closed', 'Awarded'].map((status) => (
                      <div key={status} className="flex items-center space-x-2">
                        <Checkbox
                          id={`status-${status}`}
                          checked={watchedValues.status?.includes(status)}
                          onCheckedChange={() => toggleArrayValue('status', status)}
                        />
                        <Label htmlFor={`status-${status}`} className="text-sm">
                          {status}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Saved Only Filter */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="saved-only"
                    checked={watchedValues.saved_only}
                    onCheckedChange={(checked) => setValue('saved_only', !!checked, { shouldDirty: true })}
                  />
                  <Label htmlFor="saved-only" className="text-sm">
                    Show only saved RFQs
                  </Label>
                </div>

                {/* Agency Filter */}
                {facets.agencies.length > 0 && (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Agency ({facets.agencies.length})</Label>
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {facets.agencies.slice(0, 10).map((agency) => (
                        <div key={agency.name} className="flex items-center space-x-2">
                          <Checkbox
                            id={`agency-${agency.name}`}
                            checked={watchedValues.agencies?.includes(agency.name)}
                            onCheckedChange={() => toggleArrayValue('agencies', agency.name)}
                          />
                          <Label htmlFor={`agency-${agency.name}`} className="text-sm flex-1">
                            {agency.name}
                          </Label>
                          <span className="text-xs text-muted-foreground">
                            ({agency.count})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Location Filters */}
                <Collapsible 
                  open={expandedSections.location} 
                  onOpenChange={() => toggleSection('location')}
                >
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between p-0">
                      <span className="text-sm font-medium">Location</span>
                      <Icons.chevronDown className={cn(
                        "h-4 w-4 transition-transform",
                        expandedSections.location && "rotate-180"
                      )} />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-3 pt-3">
                    {facets.states.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm">States ({facets.states.length})</Label>
                        <div className="max-h-32 overflow-y-auto space-y-1">
                          {facets.states.map((state) => (
                            <div key={state.code} className="flex items-center space-x-2">
                              <Checkbox
                                id={`state-${state.code}`}
                                checked={watchedValues.states?.includes(state.code)}
                                onCheckedChange={() => toggleArrayValue('states', state.code)}
                              />
                              <Label htmlFor={`state-${state.code}`} className="text-sm flex-1">
                                {US_STATES[state.code as keyof typeof US_STATES] || state.code}
                              </Label>
                              <span className="text-xs text-muted-foreground">
                                ({state.count})
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CollapsibleContent>
                </Collapsible>

                {/* Contract Details */}
                <Collapsible 
                  open={expandedSections.contract} 
                  onOpenChange={() => toggleSection('contract')}
                >
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between p-0">
                      <span className="text-sm font-medium">Contract Details</span>
                      <Icons.chevronDown className={cn(
                        "h-4 w-4 transition-transform",
                        expandedSections.contract && "rotate-180"
                      )} />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4 pt-3">
                    {/* Contract Value */}
                    <div className="space-y-2">
                      <Label className="text-sm">Contract Value Range</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Input
                            placeholder="Min ($)"
                            type="number"
                            {...register("contract_value_min")}
                          />
                        </div>
                        <div>
                          <Input
                            placeholder="Max ($)"
                            type="number"
                            {...register("contract_value_max")}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Contract Types */}
                    {facets.contract_types.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm">Contract Type</Label>
                        <div className="space-y-1">
                          {facets.contract_types.map((type) => (
                            <div key={type.type} className="flex items-center space-x-2">
                              <Checkbox
                                id={`contract-type-${type.type}`}
                                checked={watchedValues.contract_types?.includes(type.type)}
                                onCheckedChange={() => toggleArrayValue('contract_types', type.type)}
                              />
                              <Label htmlFor={`contract-type-${type.type}`} className="text-sm flex-1">
                                {type.type}
                              </Label>
                              <span className="text-xs text-muted-foreground">
                                ({type.count})
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Set Aside Types */}
                    {facets.set_aside_types.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm">Set Aside Type</Label>
                        <div className="space-y-1">
                          {facets.set_aside_types.map((type) => (
                            <div key={type.type} className="flex items-center space-x-2">
                              <Checkbox
                                id={`set-aside-${type.type}`}
                                checked={watchedValues.set_aside_types?.includes(type.type)}
                                onCheckedChange={() => toggleArrayValue('set_aside_types', type.type)}
                              />
                              <Label htmlFor={`set-aside-${type.type}`} className="text-sm flex-1">
                                {type.type}
                              </Label>
                              <span className="text-xs text-muted-foreground">
                                ({type.count})
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CollapsibleContent>
                </Collapsible>

                {/* Date Filters */}
                <Collapsible 
                  open={expandedSections.dates} 
                  onOpenChange={() => toggleSection('dates')}
                >
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between p-0">
                      <span className="text-sm font-medium">Date Range</span>
                      <Icons.chevronDown className={cn(
                        "h-4 w-4 transition-transform",
                        expandedSections.dates && "rotate-180"
                      )} />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4 pt-3">
                    <div className="space-y-2">
                      <Label className="text-sm">Deadline Date Range</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Input
                            placeholder="From"
                            type="date"
                            {...register("deadline_from")}
                          />
                        </div>
                        <div>
                          <Input
                            placeholder="To"
                            type="date"
                            {...register("deadline_to")}
                          />
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>

              <SheetFooter className="gap-2">
                <Button type="button" variant="outline" onClick={clearFilters}>
                  Clear All
                </Button>
                <Button type="submit" disabled={!isDirty}>
                  Apply Filters
                </Button>
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {currentFilters.keyword && (
            <Badge variant="secondary" className="gap-1">
              Search: "{currentFilters.keyword}"
              <button
                onClick={() => onFiltersChange({ ...currentFilters, keyword: undefined })}
                className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
              >
                <Icons.x className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {currentFilters.agencies?.map(agency => (
            <Badge key={`agency-${agency}`} variant="secondary" className="gap-1">
              {agency}
              <button
                onClick={() => onFiltersChange({
                  ...currentFilters,
                  agencies: currentFilters.agencies?.filter(a => a !== agency)
                })}
                className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
              >
                <Icons.x className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {currentFilters.states?.map(state => (
            <Badge key={`state-${state}`} variant="secondary" className="gap-1">
              {US_STATES[state as keyof typeof US_STATES] || state}
              <button
                onClick={() => onFiltersChange({
                  ...currentFilters,
                  states: currentFilters.states?.filter(s => s !== state)
                })}
                className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
              >
                <Icons.x className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {currentFilters.saved_only && (
            <Badge variant="secondary" className="gap-1">
              Saved Only
              <button
                onClick={() => onFiltersChange({ ...currentFilters, saved_only: false })}
                className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
              >
                <Icons.x className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}