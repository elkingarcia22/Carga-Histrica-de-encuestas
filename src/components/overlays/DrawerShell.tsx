import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export interface DrawerShellProps {
  /** Controlled open state */
  open?: boolean
  /** Event handler for open state changes */
  onOpenChange?: (open: boolean) => void
  /** The element that triggers the drawer */
  trigger?: React.ReactNode
  /** Main title of the drawer */
  title?: string
  /** Brief description or subtitle */
  description?: string
  /** Drawer body content */
  children?: React.ReactNode
  /** Custom footer content (replaces actions) */
  footer?: React.ReactNode
  /** Action buttons (usually Primary and Cancel) */
  actions?: React.ReactNode
  /** Side from which the drawer appears */
  side?: "left" | "right" | "top" | "bottom"
  /** Enterprise size variants */
  size?: "sm" | "md" | "lg" | "xl"
  /** Custom classes for the sheet content */
  className?: string
  /** Whether to show the close button (default: true) */
  showCloseButton?: boolean
}

const sideSizeClasses = {
  right: {
    sm: "sm:max-w-sm", // 384px
    md: "sm:max-w-md", // 448px
    lg: "sm:max-w-lg", // 512px
    xl: "sm:max-w-xl", // 576px
  },
  left: {
    sm: "sm:max-w-sm",
    md: "sm:max-w-md",
    lg: "sm:max-w-lg",
    xl: "sm:max-w-xl",
  },
  top: {
    sm: "h-[30vh]",
    md: "h-[50vh]",
    lg: "h-[70vh]",
    xl: "h-[90vh]",
  },
  bottom: {
    sm: "h-[30vh]",
    md: "h-[50vh]",
    lg: "h-[70vh]",
    xl: "h-[90vh]",
  },
}

export function DrawerShell({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  children,
  footer,
  actions,
  side = "right",
  size = "md",
  className,
  showCloseButton = true,
}: DrawerShellProps) {
  const sizeClass = sideSizeClasses[side][size]

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
      <SheetContent 
        side={side} 
        className={cn(sizeClass, className)}
        showCloseButton={showCloseButton}
      >
        {(title || description) && (
          <SheetHeader className="border-b bg-muted/20">
            {title && <SheetTitle>{title}</SheetTitle>}
            {description && <SheetDescription>{description}</SheetDescription>}
          </SheetHeader>
        )}
        
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>

        {footer ? (
          footer
        ) : actions ? (
          <SheetFooter className="border-t bg-muted/20">
            {actions}
          </SheetFooter>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
