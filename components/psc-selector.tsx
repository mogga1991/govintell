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
import { PSC_CODES, type PscCode, searchPscCodes, getPscCategories } from "@/lib/psc-data"

interface PscSelectorProps {
  value?: string // Comma-separated PSC codes
  onChange?: (value: string) => void
  onBlur?: () => void
  placeholder?: string
  disabled?: boolean
  maxSelections?: number
  className?: string
}

export function PscSelector({
  value = "",
  onChange,
  onBlur,
  placeholder = "Search and select PSC codes...",
  disabled = false,
  maxSelections = 5,
  className,
}: PscSelectorProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [pscCodes, setPscCodes] = React.useState<PscCode[]>(PSC_CODES)
  const [isLoading, setIsLoading] = React.useState(false)

  // Parse selected PSC codes from string value
  const selectedCodes = React.useMemo(() => {
    if (!value) return []
    return value.split(",").map(code => code.trim()).filter(Boolean)
  }, [value])

  // Get selected PSC code objects
  const selectedPscCodes = React.useMemo(() => {
    return pscCodes.filter(psc => selectedCodes.includes(psc.code))
  }, [pscCodes, selectedCodes])

  // Filter PSC codes based on search query
  const filteredPscCodes = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return pscCodes
    }
    return searchPscCodes(searchQuery)
  }, [pscCodes, searchQuery])

  // Handle PSC code selection
  const handleSelect = React.useCallback((pscCode: PscCode) => {
    const isSelected = selectedCodes.includes(pscCode.code)
    
    if (isSelected) {
      // Remove the PSC code
      const newCodes = selectedCodes.filter(code => code !== pscCode.code)
      const newValue = newCodes.join(", ")
      onChange?.(newValue)
    } else {
      // Add the PSC code
      if (selectedCodes.length >= maxSelections) {
        toast({
          title: "Maximum selections reached",
          description: `You can only select up to ${maxSelections} PSC codes.`,
          variant: "destructive",
        })
        return
      }
      
      const newCodes = [...selectedCodes, pscCode.code]
      const newValue = newCodes.join(", ")
      onChange?.(newValue)
    }
  }, [selectedCodes, maxSelections, onChange])

  // Handle removing a selected PSC code
  const handleRemove = React.useCallback((codeToRemove: string) => {
    const newCodes = selectedCodes.filter(code => code !== codeToRemove)
    const newValue = newCodes.join(", ")
    onChange?.(newValue)
  }, [selectedCodes, onChange])

  // Group PSC codes by category
  const groupedPscCodes = React.useMemo(() => {
    const categories = getPscCategories()
    const grouped: Record<string, PscCode[]> = {}
    
    categories.forEach(category => {
      grouped[category] = filteredPscCodes.filter(psc => psc.category === category)
    })
    
    // Add uncategorized codes
    const uncategorized = filteredPscCodes.filter(psc => !psc.category)
    if (uncategorized.length > 0) {
      grouped["Other"] = uncategorized
    }
    
    return grouped
  }, [filteredPscCodes])

  return (
    <div className={cn("space-y-2", className)}>
      <Label>Product Service Codes (PSC)</Label>
      
      {/* Selected PSC codes */}
      {selectedPscCodes.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedPscCodes.map((psc) => (
            <Badge
              key={psc.code}
              variant="secondary"
              className="text-xs"
            >
              {psc.code} - {psc.title}
              <button
                type="button"
                onClick={() => handleRemove(psc.code)}
                className="ml-1 hover:text-destructive"
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* PSC code selector */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            <span className="truncate">
              {selectedPscCodes.length > 0
                ? `${selectedPscCodes.length} PSC code${selectedPscCodes.length > 1 ? 's' : ''} selected`
                : placeholder
              }
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" style={{ minWidth: "var(--radix-popover-trigger-width)" }}>
          <Command shouldFilter={false}>
            <CommandInput 
              placeholder="Search PSC codes..." 
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              <CommandEmpty>No PSC codes found.</CommandEmpty>
              
              {Object.entries(groupedPscCodes).map(([category, codes]) => (
                codes.length > 0 && (
                  <CommandGroup key={category} heading={category}>
                    {codes.map((psc) => {
                      const isSelected = selectedCodes.includes(psc.code)
                      return (
                        <CommandItem
                          key={psc.code}
                          value={`${psc.code} ${psc.title} ${psc.description}`}
                          onSelect={() => handleSelect(psc)}
                          className="flex items-start gap-2 py-2"
                        >
                          <Check
                            className={cn(
                              "mt-1 h-4 w-4",
                              isSelected ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm">
                              {psc.code} - {psc.title}
                            </div>
                            <div className="text-xs text-muted-foreground line-clamp-2">
                              {psc.description}
                            </div>
                          </div>
                        </CommandItem>
                      )
                    })}
                  </CommandGroup>
                )
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      {selectedCodes.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {selectedCodes.length}/{maxSelections} PSC codes selected
        </p>
      )}
    </div>
  )
}