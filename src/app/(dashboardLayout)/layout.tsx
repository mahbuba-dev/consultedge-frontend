
import DashboardNavbar from "@/components/modules/dashboard/DashboardNavbar"
import DashboardSidebar from "@/components/modules/dashboard/dashboardSideBar"

import React from "react"

const RootDashboardLayout = async ({children} : {children: React.ReactNode}) => {
  return (
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
  )
}

export default RootDashboardLayout