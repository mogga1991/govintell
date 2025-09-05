import * as React from "react"

interface MdxProps {
  code: string
}

export function Mdx({ code }: MdxProps) {
  return (
    <div className="prose dark:prose-invert max-w-none">
      <div className="text-muted-foreground">
        MDX content placeholder - Component needs implementation
      </div>
    </div>
  )
}