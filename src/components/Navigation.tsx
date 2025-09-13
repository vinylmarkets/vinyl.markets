import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Zap, Menu, X } from "lucide-react";
import { siteNavigation } from "@/data/sitemap";
import { cn } from "@/lib/utils";

export const Navigation = () => {
  const [terminalValue, setTerminalValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50" style={{ backgroundColor: 'hsl(var(--header-background))', color: 'hsl(var(--header-foreground))' }}>
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold" style={{ color: 'hsl(var(--header-foreground))' }}>Tubeamp</h1>
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-secondary hover:text-secondary/80 transition-colors"
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
                        <NavigationMenuTrigger className="text-secondary hover:text-secondary/80 bg-transparent">
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
                          className="inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-secondary hover:text-secondary/80 transition-colors focus:outline-none"
                        >
                          {item.title}
                        </Link>
                      </NavigationMenuLink>
                    )}
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>

            {/* Terminal-style Ask Tubeamp - Desktop */}
            <div className="flex items-center gap-2 bg-black/90 border border-secondary/30 rounded px-3 py-2">
              <span className="text-secondary text-sm font-mono">$</span>
              <div className="relative flex items-center">
                <input
                  ref={inputRef}
                  type="text"
                  value={terminalValue}
                  onChange={(e) => setTerminalValue(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="Ask Tubeamp anything..."
                  className="bg-transparent text-secondary text-sm font-mono placeholder:text-secondary/50 focus:outline-none w-48"
                />
                <span className={`text-secondary font-mono text-sm ml-0.5 animate-pulse`}>|</span>
              </div>
              <button 
                onClick={() => inputRef.current?.focus()}
                className="text-secondary hover:text-secondary/80 text-sm font-mono transition-colors"
              >
                ⏎
              </button>
            </div>
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
                    className="block text-secondary hover:text-secondary/80 font-medium py-2 transition-colors"
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
                          className="block text-sm text-secondary/70 hover:text-secondary/90 py-1 transition-colors"
                        >
                          {child.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Terminal-style Ask Tubeamp - Mobile */}
            <div className="mt-6">
              <div className="flex items-center gap-2 bg-black/90 border border-secondary/30 rounded px-3 py-2">
                <span className="text-secondary text-sm font-mono">$</span>
                <div className="relative flex items-center flex-1">
                  <input
                    type="text"
                    value={terminalValue}
                    onChange={(e) => setTerminalValue(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="Ask Tubeamp anything..."
                    className="bg-transparent text-secondary text-sm font-mono placeholder:text-secondary/50 focus:outline-none w-full"
                  />
                  <span className={`text-secondary font-mono text-sm ml-0.5 animate-pulse`}>|</span>
                </div>
                <button 
                  className="text-secondary hover:text-secondary/80 text-sm font-mono transition-colors"
                >
                  ⏎
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};