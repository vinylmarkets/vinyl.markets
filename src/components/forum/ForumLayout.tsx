import React from 'react';
import { Outlet } from 'react-router-dom';

interface ForumLayoutProps {
  children?: React.ReactNode;
}

export function ForumLayout({ children }: ForumLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Community Forum</h1>
          <p className="text-muted-foreground mt-2">Connect with other investors and share insights</p>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <div className="bg-card rounded-lg border p-6">
              <h2 className="font-semibold mb-4">Categories</h2>
              {/* Categories will be populated here */}
            </div>
          </aside>
          
          <main className="lg:col-span-3">
            {children || <Outlet />}
          </main>
        </div>
      </div>
    </div>
  );
}