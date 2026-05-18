"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { updateRole } from "@/lib/auth-api";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User as UserIcon, Briefcase, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const roles = [
  {
    id: "citizen",
    title: "Citizen",
    description: "Submit permits and track your project status.",
    icon: UserIcon,
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
  const { user, token, isLoading, reloadUser } = useAuth();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleComplete = async (roleOverride?: string) => {
    const roleToSubmit = roleOverride || selectedRole;
    if (!roleToSubmit || !user || !token) return;

    setIsSubmitting(true);
    try {
      await updateRole(roleToSubmit, token);
      await reloadUser();
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Onboarding failed", error);
      alert(error.message || "Failed to save role. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!isLoading && user && user.role) {
      router.push("/dashboard");
    }
  }, [isLoading, user, router]);

  if (isLoading) return null;

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center space-y-6">
        <h1 className="font-serif text-3xl font-bold">Authentication Required</h1>
        <p className="text-muted-foreground">You must be signed in to configure your profile.</p>
        <Button onClick={() => router.push("/")} size="lg" className="rounded-full">
          Return Home to Sign In
        </Button>
      </div>
    );
  }

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
                    isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
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
