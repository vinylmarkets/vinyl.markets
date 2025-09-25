import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Zap, Menu, X, User, LogOut, Settings } from "lucide-react";
import { siteNavigation } from "@/data/sitemap";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/AuthProvider";

export const Navigation = () => {
  const [terminalValue, setTerminalValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  
  const { user, signOut } = useAuth();
  
  const handleAuth = () => {
    navigate('/auth');
  };
  
  const handleSignOut = async () => {
    await signOut();
    setMobileMenuOpen(false);
  };
  
  const getUserInitials = (user: any) => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  return (
    <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-white">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img 
              src="/atomicmarket-logo-black.png" 
              alt="AtomicMarket"
              className="h-8"
            />
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-black hover:text-black/80 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Main Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <NavigationMenu>
              <NavigationMenuList>
                {siteNavigation.slice(1).map((item) => (
                  <NavigationMenuItem key={item.href}>
                    {item.children ? (
                      <>
                        <NavigationMenuTrigger className="text-black hover:text-black/80 bg-transparent">
                          {item.title}
                        </NavigationMenuTrigger>
                         <NavigationMenuContent>
                          <div className="grid w-80 gap-0 p-2">
                            <div className="row-span-3 mb-2">
                              <NavigationMenuLink asChild>
                                <Link
                                  className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-4 no-underline outline-none focus:shadow-md"
                                  to={item.href}
                                >
                                  <div className="mb-1 mt-2 text-base font-medium">
                                    {item.title}
                                  </div>
                                  <p className="text-xs leading-tight text-muted-foreground">
                                    {item.description}
                                  </p>
                                </Link>
                              </NavigationMenuLink>
                            </div>
                            {item.children.map((child, index) => (
                              <NavigationMenuLink key={child.href} asChild>
                                <Link
                                  to={child.href}
                                  className={cn(
                                    "block select-none space-y-1 rounded-none px-3 py-2 leading-none no-underline outline-none transition-colors text-xs",
                                    index % 2 === 0 
                                      ? "bg-white hover:bg-ledger-hover-green" 
                                      : "bg-ledger-light-green hover:bg-ledger-hover-green"
                                  )}
                                  style={{
                                    backgroundColor: index % 2 === 0 ? 'hsl(0 0% 100%)' : 'hsl(var(--ledger-light-green))'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'hsl(var(--ledger-hover-green))';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'hsl(0 0% 100%)' : 'hsl(var(--ledger-light-green))';
                                  }}
                                >
                                  <div className="text-xs font-medium leading-none text-foreground">{child.title}</div>
                                  <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                                    {child.description}
                                  </p>
                                </Link>
                              </NavigationMenuLink>
                            ))}
                          </div>
                        </NavigationMenuContent>
                      </>
                    ) : (
                      <NavigationMenuLink asChild>
                        <Link
                          to={item.href}
                          className="inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-black hover:text-black/80 transition-colors focus:outline-none"
                        >
                          {item.title}
                        </Link>
                      </NavigationMenuLink>
                    )}
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>


            {/* Authentication */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-secondary text-secondary-foreground">
                        {getUserInitials(user)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 z-50 bg-background border-border" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium text-sm">
                        {user.user_metadata?.full_name || "User"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="w-full cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleAuth}
                  className="text-black hover:text-black/80"
                >
                  Log In
                </Button>
                <Button
                  size="sm"
                  onClick={handleAuth}
                  className="bg-primary hover:bg-primary/90 text-black"
                >
                  Sign Up Free
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border/50">
            <nav className="flex flex-col gap-4 mt-4">
              {siteNavigation.slice(1).map((item) => (
                <div key={item.href}>
                  <Link
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-black hover:text-black/80 font-medium py-2 transition-colors"
                  >
                    {item.title}
                  </Link>
                  {item.children && (
                    <div className="ml-4 mt-2 space-y-2">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          to={child.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="block text-sm text-black/70 hover:text-black/90 py-1 transition-colors"
                        >
                          {child.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
              {/* Mobile Authentication */}
              {user ? (
                <div className="border-t border-border/50 pt-4 mt-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                        {getUserInitials(user)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {user.user_metadata?.full_name || "User"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 text-black hover:text-black/80 py-2 transition-colors"
                    >
                      <User className="h-4 w-4" />
                      Dashboard
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2 text-black hover:text-black/80 py-2 transition-colors w-full text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-t border-border/50 pt-4 mt-4 space-y-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      handleAuth();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-black hover:text-black/80"
                  >
                    Log In
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      handleAuth();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full bg-primary hover:bg-primary/90 text-black"
                  >
                    Sign Up Free
                  </Button>
                </div>
              )}
            </nav>

          </div>
        )}
      </div>
    </header>
  );
};