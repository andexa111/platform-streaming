"use client";
import React, { useState } from "react";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { cn } from "@/lib/utils";

/**
 * SECRET ADMIN PANEL — path: /xK9mZp2wQ7
 * Mirror of /admin layout but using real data.
 * This URL is NOT linked anywhere — only known internally.
 */
export default function SecretAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <AdminSidebar 
        isOpen={isSidebarOpen} 
        isCollapsed={isCollapsed}
        onClose={() => setIsSidebarOpen(false)} 
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />
      <div className={cn(
        "flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300",
        isCollapsed ? "lg:ml-0" : ""
      )}>
        <AdminHeader onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 scrollbar-hide">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
