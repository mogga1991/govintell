"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Search, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { toast } from "@/components/ui/use-toast"

interface NaicsCode {
  code: string
  title: string
  description: string
  category?: string
}

interface NaicsSelectorProps {
  value?: string // Comma-separated NAICS codes
  onChange?: (value: string) => void
  onBlur?: () => void
  placeholder?: string
  disabled?: boolean
  maxSelections?: number
  className?: string
}

export function NaicsSelector({
  value = "",
  onChange,
  onBlur,
  placeholder = "Search and select NAICS codes...",
  disabled = false,
  maxSelections = 5,
  className,
}: NaicsSelectorProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [naicsCodes, setNaicsCodes] = React.useState<NaicsCode[]>([])
  const [loading, setLoading] = React.useState(false)
  const [selectedCodes, setSelectedCodes] = React.useState<string[]>(
    value ? value.split(",").filter(Boolean) : []
  )

  // Create a ref for debouncing at the top level - this fixes the hooks violation
  const timeoutRef = React.useRef<NodeJS.Timeout>()

  // Search for NAICS codes
  const searchNaics = React.useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setNaicsCodes([])
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/naics/search?q=${encodeURIComponent(query)}&limit=10`)
      const data = await response.json()
      
      if (data.success) {
        setNaicsCodes(data.naics_codes || [])
      } else {
        console.error("NAICS search failed:", data.error)
        setNaicsCodes([])
      }
    } catch (error) {
      console.error("NAICS search error:", error)
      toast({
        title: "Search failed",
        description: "Failed to search NAICS codes. Please try again.",
        variant: "destructive",
      })
      setNaicsCodes([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Debounced search function - moved the ref to top level
  const debouncedSearch = React.useCallback((query: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    timeoutRef.current = setTimeout(() => {
      searchNaics(query)
    }, 300)
  }, [searchNaics])

  // Handle search input change
  React.useEffect(() => {
    if (searchQuery) {
      debouncedSearch(searchQuery)
    } else {
      setNaicsCodes([])
    }
  }, [searchQuery, debouncedSearch])

  // Update selected codes when value prop changes
  React.useEffect(() => {
    const newSelectedCodes = value ? value.split(",").filter(Boolean) : []
    setSelectedCodes(newSelectedCodes)
  }, [value])

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // Handle code selection
  const handleSelectCode = React.useCallback((code: string) => {
    setSelectedCodes(prevCodes => {
      let newSelectedCodes: string[]

      if (prevCodes.includes(code)) {
        // Remove code if already selected
        newSelectedCodes = prevCodes.filter(c => c !== code)
      } else {
        // Add code if not already selected and under limit
        if (prevCodes.length >= maxSelections) {
          toast({
            title: "Maximum selections reached",
            description: `You can select up to ${maxSelections} NAICS codes.`,
            variant: "destructive",
          })
          return prevCodes
        }
        newSelectedCodes = [...prevCodes, code]
      }

      onChange?.(newSelectedCodes.join(","))
      return newSelectedCodes
    })
  }, [maxSelections, onChange])

  // Remove a selected code
  const handleRemoveCode = React.useCallback((code: string) => {
    setSelectedCodes(prevCodes => {
      const newSelectedCodes = prevCodes.filter(c => c !== code)
      onChange?.(newSelectedCodes.join(","))
      return newSelectedCodes
    })
  }, [onChange])

  // Get selected NAICS data for display - fix the undefined dependency issue
  const selectedNaicsData = React.useMemo(() => {
    return selectedCodes.map(code => {
      const naicsData = naicsCodes.find(n => n.code === code)
      return naicsData || { code, title: `NAICS ${code}`, description: "" }
    })
  }, [selectedCodes, naicsCodes])

  return (
    <div className={cn("space-y-2", className)}>
      {/* Selected codes display */}
      {selectedCodes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedNaicsData.map((naics) => (
            <Badge
              key={naics.code}
              variant="secondary"
              className="flex items-center gap-1 text-xs"
            >
              <span>{naics.code}</span>
              <span className="text-muted-foreground">-</span>
              <span className="max-w-[200px] truncate">{naics.title}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemoveCode(naics.code)}
                  className="ml-1 rounded-full hover:bg-muted-foreground/20"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          ))}
        </div>
      )}

      {/* Search and select */}
      <Popover open={open && !disabled} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between text-left font-normal"
            disabled={disabled}
          >
            {selectedCodes.length > 0
              ? `${selectedCodes.length} NAICS code${selectedCodes.length > 1 ? "s" : ""} selected`
              : placeholder
            }
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command>
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <input
                placeholder="Search NAICS codes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <CommandList>
              {loading && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Searching...
                </div>
              )}
              {!loading && searchQuery && naicsCodes.length === 0 && (
                <CommandEmpty>No NAICS codes found.</CommandEmpty>
              )}
              {!loading && naicsCodes.length > 0 && (
                <CommandGroup>
                  {naicsCodes.map((naics) => (
                    <CommandItem
                      key={naics.code}
                      onSelect={() => handleSelectCode(naics.code)}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center space-x-2 w-full">
                        <div
                          className={cn(
                            "flex h-4 w-4 items-center justify-center rounded border border-primary",
                            selectedCodes.includes(naics.code)
                              ? "bg-primary text-primary-foreground"
                              : "opacity-50"
                          )}
                        >
                          <Check className={cn("h-3 w-3")} />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-medium">
                              {naics.code}
                            </span>
                            {naics.category && (
                              <Badge variant="outline" className="text-xs">
                                {naics.category}
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm font-medium">{naics.title}</div>
                          <div className="text-xs text-muted-foreground line-clamp-2">
                            {naics.description}
                          </div>
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              {!searchQuery && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Enter at least 2 characters to search for NAICS codes.
                </div>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Helper text */}
      <div className="text-xs text-muted-foreground">
        Select up to {maxSelections} NAICS codes that best describe your business.
        {selectedCodes.length > 0 && (
          <span className="ml-1">
            ({selectedCodes.length}/{maxSelections} selected)
          </span>
        )}
      </div>
    </div>
  )
}