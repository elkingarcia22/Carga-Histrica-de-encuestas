import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "group/alert relative grid w-full gap-0.5 rounded-lg border p-4 text-left text-sm has-data-[slot=alert-action]:relative has-data-[slot=alert-action]:pr-18 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-3 *:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg]:text-current *:[svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-card text-foreground",
        destructive:
          "border-destructive/40 text-destructive [&>svg]:text-destructive bg-destructive/5 dark:border-[#E20D34] dark:bg-[#801B21] dark:text-[#FFD2CD] dark:[&>svg]:text-[#FFD2CD]",
        info:
          "border-blue-500/40 text-blue-700 [&>svg]:text-blue-700 bg-blue-50/60 dark:border-[#B6B5FC] dark:bg-[#2B3F79] dark:text-[#D6DBFF] dark:[&>svg]:text-[#D6DBFF]",
        warning:
          "border-amber-500/40 text-amber-700 [&>svg]:text-amber-700 bg-amber-50/60 dark:border-[#A4621B] dark:bg-[#5E3A16] dark:text-[#FFD4A0] dark:[&>svg]:text-[#FFD4A0]",
        success:
          "border-emerald-500/40 text-emerald-700 [&>svg]:text-emerald-700 bg-emerald-50/60 dark:border-[#368226] dark:bg-[#254B1B] dark:text-[#BDE9AC] dark:[&>svg]:text-[#BDE9AC]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "font-medium leading-none tracking-tight group-has-[>svg]/alert:col-start-2",
        className
      )}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-sm text-muted-foreground group-has-[>svg]/alert:col-start-2 [&_p]:leading-relaxed",
        className
      )}
      {...props}
    />
  )
}

function AlertAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-action"
      className={cn("absolute top-4 right-4", className)}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription, AlertAction }
