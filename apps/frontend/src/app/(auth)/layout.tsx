import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-grow flex flex-col justify-center">
        {children}
      </main>
    </div>
  );
}
