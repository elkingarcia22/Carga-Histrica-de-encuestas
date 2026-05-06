import * as React from "react";
import { cn } from "@/lib/utils";
import { UbitsIcon } from "@/icons";
import type { SidebarProps, NavigationItem } from "./navigationTypes";

/**
 * UBITS PREMIUM PLAYGROUND SIDEBAR
 * Consistent Visual Identity: Using the Deep Navy/Slate background for both modes.
 * Background: #111827 (Deep Professional Navy) for both Light and Dark.
 */
export const PlaygroundSidebar: React.FC<SidebarProps> = ({
  items,
  activeItemId,
  onItemSelect,
  role = "admin",
  header,
  footer,
  className,
}) => {
  const renderItem = (item: NavigationItem) => {
    const isActive = activeItemId === item.id || item.active;
    const isDisabled = item.disabled;

    if (item.role && item.role !== "shared" && item.role !== role) {
      return null;
    }

    return (
      <button
        key={item.id}
        type="button"
        disabled={isDisabled}
        onClick={() => !isDisabled && onItemSelect?.(item.id)}
        className={cn(
          "relative flex items-center justify-center w-11 h-11 transition-all duration-300 rounded-full group mb-2",
          isActive
            ? "bg-[#0C5BEF] text-white shadow-[0_0_25px_rgba(12,91,239,0.3)] scale-110"
            : "text-white/30 hover:text-white hover:bg-white/5 hover:scale-105",
          isDisabled && "opacity-30 cursor-not-allowed"
        )}
        aria-label={item.label}
      >
        {item.icon && (
          <UbitsIcon
            name={item.icon}
            size="sm"
            tone="inverse"
            className={cn(
              "flex-shrink-0 transition-transform duration-300",
              isActive ? "scale-100" : "group-hover:scale-105"
            )}
          />
        )}
      </button>
    );
  };

  return (
    <aside
      className={cn(
        "fixed left-6 top-4 w-[96px] h-[calc(100vh-32px)] z-50 flex flex-col items-center py-8 rounded-[32px] shadow-2xl transition-all duration-700",
        "bg-[#111827] border border-white/5",
        className
      )}
    >
      {/* Header / Logo */}
      <div className="mb-12">
        {header}
      </div>

      {/* Navigation Body */}
      <div className="flex-1 flex flex-col items-center w-full overflow-y-auto no-scrollbar pt-2 px-4">
        {items.map((section) => (
          <div key={section.id} className="flex flex-col items-center w-full">
            {section.items.map(renderItem)}
          </div>
        ))}
      </div>

      {/* Subtle Divider */}
      <div className="w-10 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent my-6" />

      {/* Footer Area */}
      <div className="flex flex-col items-center gap-5 pb-4">
        {footer}
      </div>
    </aside>
  );
};
