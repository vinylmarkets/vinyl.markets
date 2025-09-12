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
import { Zap } from "lucide-react";
import { siteNavigation } from "@/data/sitemap";
import { cn } from "@/lib/utils";

export const Navigation = () => {
  const [terminalValue, setTerminalValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
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
                          <div className="grid w-96 gap-3 p-4">
                            <div className="row-span-3">
                              <NavigationMenuLink asChild>
                                <Link
                                  className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                                  to={item.href}
                                >
                                  <div className="mb-2 mt-4 text-lg font-medium">
                                    {item.title}
                                  </div>
                                  <p className="text-sm leading-tight text-muted-foreground">
                                    {item.description}
                                  </p>
                                </Link>
                              </NavigationMenuLink>
                            </div>
                            {item.children.map((child) => (
                              <NavigationMenuLink key={child.href} asChild>
                                <Link
                                  to={child.href}
                                  className={cn(
                                    "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                  )}
                                >
                                  <div className="text-sm font-medium leading-none">{child.title}</div>
                                  <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
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

            {/* Terminal-style Ask Tubeamp */}
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
                <span className={`text-secondary font-mono text-sm ml-0.5 ${isFocused ? 'animate-pulse' : 'opacity-0'}`}>|</span>
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
      </div>
    </header>
  );
};