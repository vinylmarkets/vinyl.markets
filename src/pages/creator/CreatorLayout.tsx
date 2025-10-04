import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  BarChart3, 
  DollarSign, 
  Settings,
  Plus,
  Menu
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function CreatorLayout() {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const navigation = [
    { name: 'Dashboard', href: '/creator', icon: LayoutDashboard, exact: true },
    { name: 'My Amps', href: '/creator/amps', icon: BarChart3 },
    { name: 'Earnings', href: '/creator/earnings', icon: DollarSign },
    { name: 'Settings', href: '/creator/settings', icon: Settings },
  ];

  const NavLinks = () => (
    <>
      {navigation.map((item) => {
        const Icon = item.icon;
        const active = item.exact 
          ? location.pathname === item.href
          : isActive(item.href);
        
        return (
          <Link key={item.name} to={item.href}>
            <Button
              variant={active ? "default" : "ghost"}
              className="w-full justify-start"
            >
              <Icon className="w-4 h-4 mr-2" />
              {item.name}
            </Button>
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <div className="flex flex-col gap-2 mt-8">
                  <NavLinks />
                </div>
              </SheetContent>
            </Sheet>
            
            <h1 className="text-xl font-bold">Creator Studio</h1>
          </div>

          <Link to="/creator/amps/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Amp
            </Button>
          </Link>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:block w-64 border-r bg-card min-h-[calc(100vh-61px)]">
          <nav className="p-4 space-y-2">
            <NavLinks />
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
