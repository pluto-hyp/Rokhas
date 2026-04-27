"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Briefcase, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const roles = [
  {
    id: "citizen",
    title: "Citizen",
    description: "Submit permits and track your project status.",
    icon: User,
  },
  {
    id: "architect",
    title: "Architect",
    description: "Manage multiple clients and technical submissions.",
    icon: Briefcase,
  },
  {
    id: "authority",
    title: "Authority",
    description: "Review dossiers and manage urban planning approvals.",
    icon: ShieldCheck,
  },
];

export default function OnboardingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isLoaded) return null;

  const handleComplete = async (roleOverride?: string) => {
    const roleToSubmit = roleOverride || selectedRole;
    if (!roleToSubmit || !user) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: roleToSubmit }),
      });

      if (res.ok) {
        // Essential: reload the user to refresh the client-side metadata cache
        await user.reload();
        router.push("/dashboard");
      } else {
        const errorText = await res.text();
        alert("Failed to save role: " + errorText);
      }
    } catch (error) {
      console.error("Onboarding failed", error);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto-assign "citizen" role to Google users for a seamless experience
  useEffect(() => {
    if (isLoaded && user && !user.publicMetadata?.role) {
      const isGoogleUser = user.externalAccounts.some(
        (account) => account.provider === "google"
      );
      if (isGoogleUser) {
        handleComplete("citizen");
      }
    }
  }, [isLoaded, user]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-3xl w-full space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="font-serif text-4xl font-bold tracking-tight">Welcome to Rokhas.</h1>
          <p className="text-muted-foreground text-lg">Select your profile type to customize your experience.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;
            
            return (
              <Card 
                key={role.id}
                className={cn(
                  "cursor-pointer transition-all duration-300 border-2 hover:border-primary/50",
                  isSelected ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border/40"
                )}
                onClick={() => setSelectedRole(role.id)}
              >
                <CardHeader>
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 transition-colors",
                    isSelected ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                  )}>
                    <Icon size={24} />
                  </div>
                  <CardTitle className="text-xl font-serif">{role.title}</CardTitle>
                  <CardDescription>{role.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        <div className="flex justify-center pt-8">
          <Button 
            size="lg" 
            className="px-12 rounded-full font-bold uppercase tracking-widest text-xs h-12"
            disabled={!selectedRole || isSubmitting}
            onClick={() => handleComplete()}
          >
            {isSubmitting ? "Configuring..." : "Complete Setup"}
          </Button>
        </div>
      </div>
    </div>
  );
}
