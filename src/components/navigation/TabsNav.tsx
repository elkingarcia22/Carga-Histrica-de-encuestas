import * as React from "react"
import { cn } from "@/lib/utils"

export interface Tab {
  id: string
  label: string
}

interface TabsNavProps extends React.HTMLAttributes<HTMLDivElement> {
  tabs: Tab[]
  activeTabId: string
  onTabChange: (id: string) => void
}

const TabsNav = React.forwardRef<HTMLDivElement, TabsNavProps>(
  ({ tabs, activeTabId, onTabChange, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center space-x-8 border-b border-border w-full bg-card px-8",
          className
        )}
        {...props}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "relative py-4 text-sm font-medium transition-all hover:text-text-primary focus:outline-none",
                isActive 
                  ? "text-primary" 
                  : "text-text-muted"
              )}
            >
              {tab.label}
              {isActive && (
                <span className="absolute bottom-0 left-0 h-[2px] w-full bg-primary" />
              )}
            </button>
          )
        })}
      </div>
    )
  }
)

TabsNav.displayName = "TabsNav"

export { TabsNav }
