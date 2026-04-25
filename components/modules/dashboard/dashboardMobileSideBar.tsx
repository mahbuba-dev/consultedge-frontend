"use client"

import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { SheetTitle } from "@/components/ui/sheet";
import { getIconComponent } from "@/src/lib/iconMapper";
import { cn } from "@/src/lib/utils";
import { NavSection } from "@/src/types/dashboard.types";
import { UserInfo } from "@/src/types/user.types";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface DashboardMobileSidebarProps{
    userInfo:UserInfo;
    navItems:NavSection[];
    dashboardHome:string;
}


const DashboardMobileSidebar = ({dashboardHome, navItems, userInfo} : DashboardMobileSidebarProps ) => {
    const pathname = usePathname()
    const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  return (
    <div className="flex h-full flex-col overflow-y-auto">
      {/* Logo / Brand */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href={dashboardHome}>
          <span className="text-xl font-bold text-primary">Consult-Edge</span>
        </Link>
      </div>

      <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

      {/* Navigation Area  */}

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navItems.map((section, sectionId) => (
            <div key={sectionId}>
              {section.title && (
                <h4 className="mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase">
                  {section.title}
                </h4>
              )}

              <div className="space-y-1">
                {section.items.map((item, id) => {
                  const Icon = getIconComponent(item.icon);

                  if (item.children && item.children.length > 0) {
                    const hasActiveChild = item.children.some((child) => pathname === child.href);
                    const isOpen = openDropdown === item.title || hasActiveChild;

                    return (
                      <div key={id} className="space-y-1">
                        <button
                          type="button"
                          onClick={() => setOpenDropdown(isOpen ? null : item.title)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                            isOpen
                              ? "bg-accent text-accent-foreground"
                              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          <span className="flex-1 text-left">{item.title}</span>
                        </button>

                        {isOpen ? (
                          <div className="ml-6 space-y-1">
                            {item.children.map((child, childId) => {
                              const ChildIcon = getIconComponent(child.icon);
                              const isChildActive = pathname === child.href;

                              return (
                                <Link
                                  href={child.href!}
                                  key={childId}
                                  className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
                                    isChildActive
                                      ? "bg-linear-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-cyan-500/25"
                                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                                  )}
                                >
                                  <ChildIcon className="h-4 w-4" />
                                  <span className="flex-1">{child.title}</span>
                                </Link>
                              );
                            })}
                          </div>
                        ) : null}
                      </div>
                    );
                  }

                  const isActive = pathname === item.href;

                  return (
                    <Link
                      href={item.href!}
                      key={id}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                        isActive
                          ? "bg-linear-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-cyan-500/25"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="flex-1">{item.title}</span>
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

      {/* User Info */}
      <div className="border-t p-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
          {/* if profile doesnt exist , use first letter of user name as profile photo like component */}
            <span className="text-sm font-semibold text-primary">
              {userInfo.name.charAt(0).toUpperCase()}
            </span>
          </div>

          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate">{userInfo.name}</p>
            <p className="text-xs text-muted-foreground capitalize">
              {userInfo.role.toLocaleLowerCase().replace("_", " ")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardMobileSidebar