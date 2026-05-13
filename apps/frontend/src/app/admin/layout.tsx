"use client";
import React, { useState } from "react";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { cn } from "@/lib/utils";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-neutral-100 text-black overflow-hidden">
      {/* Sidebar - Desktop and Mobile */}
      <AdminSidebar 
        isOpen={isSidebarOpen} 
        isCollapsed={isCollapsed}
        onClose={() => setIsSidebarOpen(false)} 
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {/* Main Container */}
      <div className={cn(
        "flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300",
        isCollapsed ? "lg:ml-0" : ""
      )}>
        {/* Header */}
        <AdminHeader onMenuClick={() => setIsSidebarOpen(true)} />

        {/* Dynamic Content Area */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 scrollbar-hide">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
