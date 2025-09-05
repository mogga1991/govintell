import * as React from "react"

import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"
import { ModeToggle } from "@/components/mode-toggle"

export function SiteFooter({ className }: React.HTMLAttributes<HTMLElement>) {
  return (
    <footer className={cn(className)}>
      <div className="container flex items-center justify-between gap-4 py-4 md:py-6">
        <div className="flex items-center gap-3">
          <Icons.logo className="h-5 w-5" />
          <p className="text-xs text-muted-foreground">
            © 2024 {siteConfig.name}
          </p>
        </div>
        <ModeToggle />
      </div>
    </footer>
  )
}
