
import DashboardNavbar from "@/components/modules/dashboard/DashboardNavbar"
import DashboardSidebar from "@/components/modules/dashboard/dashboardSideBar"
import { ChatSocketProvider } from "@/src/providers/ChatSocketProvider"
import QueryProviders from "@/src/providers/QueryProvider"

import React from "react"

// Dashboard pages depend on auth cookies / live API data — never prerender.
export const dynamic = "force-dynamic";

const RootDashboardLayout = async ({children} : {children: React.ReactNode}) => {
  return (
    <QueryProviders>
      <ChatSocketProvider>
        <div className="flex flex-col h-screen overflow-hidden">
            {/* DashboardNavbar - Full Width */}
            <DashboardNavbar />
            
            <div className="flex flex-1 overflow-hidden">
                {/* Dashboard Sidebar */}
                <DashboardSidebar />

                {/* Dashboard Content */}
                <main className="flex-1 overflow-y-auto bg-muted/10 p-4 md:p-6">
                    <div>
                        {children}
                    </div>
                </main>
            </div>
        </div>
      </ChatSocketProvider>
    </QueryProviders>
  )
}

export default RootDashboardLayout