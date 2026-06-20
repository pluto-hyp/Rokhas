"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { AppIcon } from "@/components/AppIcon";
import { useAuth } from "@/contexts/AuthContext";

export function Navbar() {
  const [scrolled, setScrolled] = React.useState(false);
  const { token } = useAuth();

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-fit px-4">
      <nav className={cn(
        "flex items-center gap-6 px-6 py-2 rounded-full border transition-all duration-500",
        scrolled 
          ? "bg-white/80 backdrop-blur-xl border-border/50 shadow-lg scale-100" 
          : "bg-white/40 backdrop-blur-md border-white/20 scale-105"
      )}>
        <Link href="/" className="flex items-center gap-2 font-serif text-xl font-bold tracking-tight text-primary hover:opacity-70 transition-opacity">
          <AppIcon className="size-5" />
          <span>Rokhas.</span>
        </Link>
        
        <div className="hidden sm:block h-6 w-px bg-border/40" />

        <NavigationMenu className="hidden sm:block">
          <NavigationMenuList className="gap-2">
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link href="#about" className="text-sm font-medium px-4 py-2 rounded-full hover:bg-black/5 transition-colors">
                  About
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link href="#workflow" className="text-sm font-medium px-4 py-2 rounded-full hover:bg-black/5 transition-colors">
                  Workflow
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <div className="hidden sm:block h-6 w-px bg-border/40" />

        <div className="flex items-center gap-3">
          {token ? (
            <Link href="/dashboard">
              <Button variant="ghost" className="rounded-full h-9 px-4 text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all">
                Dashboard
              </Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button variant="ghost" className="rounded-full h-9 px-4 text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}
