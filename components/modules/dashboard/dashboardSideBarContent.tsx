"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { getIconComponent } from "@/src/lib/iconMapper"
import { cn } from "@/src/lib/utils"
import { NavSection } from "@/src/types/dashboard.types"
import { UserInfo } from "@/src/types/user.types"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"


interface DashboardSidebarContentProps {
    userInfo : UserInfo,
    navItems : NavSection[],
    dashboardHome : string,

}



const DashboardSidebarContent = ({dashboardHome, navItems, userInfo} : DashboardSidebarContentProps) => {
    const pathname = usePathname()
    const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  return (
    <div className="hidden md:flex h-full w-64 flex-col border-r bg-card overflow-y-auto">
      {/* Logo / Brand */}
      <div className="flex h-20 items-end px-6 pb-4 border-b">
        <Link href={dashboardHome}>
          <span className="text-xl font-bold text-primary pt-4">Consult-Edge</span>
        </Link>
      </div>

      {/* Navigation Area */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-6">
          {navItems.map((section, sectionId) => (
            <div key={sectionId}>
              {section.title && (
                <h4 className="mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {section.title}
                </h4>
              )}

              <div className="space-y-1">
          {section.items.map((item, id) => {
  const Icon = getIconComponent(item.icon);

  // If item has children → dropdown
  if (item.children && item.children.length > 0) {
    const isOpen = openDropdown === item.title;

    return (
      <div key={id} className="space-y-1">
        {/* Parent clickable item */}
      <button
  onClick={() => setOpenDropdown(isOpen ? null : item.title)}
  className={cn(
    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
    isOpen
      ? "bg-accent text-accent-foreground" // OPEN STATE (not active)
      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
  )}
>
  <Icon className="w-4 h-4" />
  <span>{item.title}</span>
</button>
        {/* Dropdown children (only visible when open) */}
        {isOpen && (
          <div className="ml-6 space-y-1">
            {item.children.map((child, childId) => {
              const ChildIcon = getIconComponent(child.icon);
              const isActive = pathname === child.href;

              return (
                <Link
                  href={child.href!}
                  key={childId}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
                    isActive
                      ? "bg-violet-600 text-white"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <ChildIcon className="w-4 h-4" />
                  <span>{child.title}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Normal item (no children)
  const isActive = pathname === item.href;

  return (
    <Link
      href={item.href!}
      key={id}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
        isActive
          ? "bg-violet-600 text-white"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      )}
    >
      <Icon className="w-4 h-4" />
      <span>{item.title}</span>
    </Link>
  );
})}


              </div>

              {sectionId < navItems.length - 1 && (
                <Separator className="my-4" />
              )}
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* User Info At Bottom */}
      <div className="border-t px-3 py-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-violet-600 flex items-center justify-center shrink-0">
            <span className="text-lg font-bold text-white leading-none">
              {userInfo?.name?.charAt(0)?.toUpperCase() || "?"}
            </span>
          </div>

          <div className="flex-1 overflow-hidden min-w-0">
            <p className="text-sm font-medium truncate">{userInfo?.name || "User"}</p>
            <p className="text-xs text-muted-foreground capitalize">
              {userInfo?.role?.toLocaleLowerCase?.()?.replace("_", " ") || "guest"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardSidebarContent