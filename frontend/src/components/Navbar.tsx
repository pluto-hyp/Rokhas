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

export function Navbar() {
  const [scrolled, setScrolled] = React.useState(false);

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
        <Link href="/" className="font-serif text-xl font-bold tracking-tight text-primary hover:opacity-70 transition-opacity">
          Rokhas.
        </Link>
        
        <div className="h-6 w-px bg-border/40" />

        <NavigationMenu>
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

        <div className="h-6 w-px bg-border/40" />

        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" className="rounded-full h-9 px-4 text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all">
              Sign In
            </Button>
          </Link>
        </div>
      </nav>
    </div>
  );
}