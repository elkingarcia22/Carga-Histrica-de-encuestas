import * as React from "react";
import { cn } from "@/lib/utils";
import { UbitsIcon } from "@/icons";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import type { NavigationItem, NavigationSection } from "./navigationTypes";

interface SidebarProps {
  items: NavigationSection[];
  activeId?: string;
  onItemClick?: (id: string) => void;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  role?: string;
  activeItemId?: string;
  onItemSelect?: (id: string) => void;
}

/**
 * UBITS PREMIUM RAIL SIDEBAR
 * A fixed 80px wide navigation rail with custom styled minimalist scrollbar.
 */
export const PlaygroundSidebar: React.FC<SidebarProps> = ({
  items,
  activeId,
  onItemClick,
  header,
  footer,
  className,
  activeItemId,
  onItemSelect,
}) => {
  const currentActiveId = activeId || activeItemId;
  const handleItemClick = onItemClick || onItemSelect;

  const renderItem = (item: NavigationItem) => {
    const isActive = currentActiveId === item.id;

    return (
      <Tooltip key={item.id} delayDuration={0}>
        <TooltipTrigger asChild>
          <button
            onClick={() => handleItemClick?.(item.id)}
            className={cn(
              "relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 group outline-none",
              isActive 
                ? "bg-brand text-white shadow-lg shadow-brand/20 scale-110" 
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            )}
          >
            <UbitsIcon 
              name={item.icon as any} 
              size="sm" 
              className={cn(
                "transition-transform duration-300",
                isActive ? "scale-110" : "group-hover:scale-110"
              )} 
            />
            {isActive && (
              <div className="absolute -left-4 w-1 h-6 bg-brand rounded-r-full shadow-[0_0_8px_rgba(12,91,239,0.5)]" />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={20} className="font-medium">
          {item.label}
        </TooltipContent>
      </Tooltip>
    );
  };

  return (
    <TooltipProvider>
      <aside
        className={cn(
          "fixed left-6 top-4 bottom-4 w-20 bg-[#111827] text-white flex flex-col items-center py-8 rounded-[32px] shadow-2xl z-50 border border-white/5",
          className
        )}
      >
        {/* Header / Logo */}
        <div className="mb-12 flex-shrink-0">
          {header}
        </div>

        {/* Navigation Body with Custom Dark Scrollbar */}
        <div 
          className="flex-1 flex flex-col items-center w-full overflow-y-auto pt-2 px-4 space-y-8 custom-sidebar-scroll"
          style={{
            scrollbarWidth: 'none', /* Firefox */
            msOverflowStyle: 'none', /* IE/Edge */
          }}
        >
          <style dangerouslySetInnerHTML={{ __html: `
            .custom-sidebar-scroll::-webkit-scrollbar {
              width: 3px;
            }
            .custom-sidebar-scroll::-webkit-scrollbar-track {
              background: transparent;
            }
            .custom-sidebar-scroll::-webkit-scrollbar-thumb {
              background: rgba(255, 255, 255, 0.05);
              border-radius: 10px;
            }
            .custom-sidebar-scroll::-webkit-scrollbar-thumb:hover {
              background: rgba(255, 255, 255, 0.15);
            }
            /* Firefox alternative */
            .custom-sidebar-scroll {
              scrollbar-width: thin;
              scrollbar-color: rgba(255, 255, 255, 0.05) transparent;
            }
          `}} />
          
          {items.map((section) => (
            <div key={section.id} className="flex flex-col items-center w-full space-y-6">
              {section.items.map(renderItem)}
            </div>
          ))}
        </div>

        {/* Footer / User Profile */}
        <div className="mt-auto pt-8 flex-shrink-0">
          {footer}
        </div>
      </aside>
    </TooltipProvider>
  );
};
