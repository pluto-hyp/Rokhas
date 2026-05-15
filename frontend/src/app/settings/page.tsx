"use client";

import {
  Bell,
  Building2,
  Globe2,
  KeyRound,
  LogOut,
  ShieldCheck,
  UserRound,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  type LucideIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { updateMe } from "@/lib/auth-api";

type NavItem = "Identity" | "Organization" | "Security" | "Notifications" | "Language";

const navigation: { label: NavItem; icon: LucideIcon }[] = [
  { label: "Identity", icon: UserRound },
  { label: "Organization", icon: Building2 },
  { label: "Security", icon: ShieldCheck },
  { label: "Notifications", icon: Bell },
  { label: "Language", icon: Globe2 },
];

function formatRole(role?: string | null) {
  if (!role) return "Not configured";
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export default function SettingsPage() {
  const { user, token, logout, reloadUser } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const [active, setActive] = useState<NavItem>("Identity");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    full_name: user?.full_name || "",
    email: user?.email || "",
    password: "",
    confirm_password: "",
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        full_name: user.full_name || "",
        email: user.email || "",
      }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id.replace("-", "_")]: value }));
  };

  const handleSave = async () => {
    if (!token) return;

    if (formData.password && formData.password !== formData.confirm_password) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const updateData: any = {
        full_name: formData.full_name,
        email: formData.email,
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      await updateMe(updateData, token);
      await reloadUser();
      toast.success("Settings updated successfully");
      setFormData(prev => ({ ...prev, password: "", confirm_password: "" }));
    } catch (error) {
      console.error("Failed to update settings:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
      <section className="mx-auto max-w-7xl rounded-2xl border border-border bg-card px-6 py-8 shadow-sm sm:px-9">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
              <p className="text-base text-muted-foreground">
                Manage your Rokhas government service profile, security, and permit communication preferences.
              </p>
            </div>
            <Link href="/dashboard">
              <Button variant="outline" className="h-11 gap-2 rounded-xl border-border/40 hover:bg-muted font-bold transition-all hover:scale-[1.02] active:scale-[0.98]">
                <ArrowLeft className="size-4" />
                Return to Dashboard
              </Button>
            </Link>
          </div>
        </div>

        <Separator className="mt-8" />

        <div className="grid gap-8 pt-8 md:grid-cols-[240px_1fr] lg:gap-16">
          {/* Sidebar nav */}
          <nav aria-label="Settings navigation" className="sticky top-6 h-fit">
            <ul className="flex gap-1 overflow-x-auto pb-2 md:block md:space-y-1 md:overflow-visible md:pb-0">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = active === item.label;
                return (
                  <li key={item.label}>
                    <Button
                      type="button"
                      variant={isActive ? "secondary" : "ghost"}
                      className={`h-11 w-full justify-start gap-3 rounded-xl px-4 text-sm font-medium transition-all ${isActive ? "bg-primary text-primary-foreground hover:bg-primary/90" : "hover:bg-muted"}`}
                      onClick={() => setActive(item.label)}
                    >
                      <Icon className="size-4" />
                      {item.label}
                    </Button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Content */}
          <div className="space-y-8 pb-12">

            {/* ── Identity ── */}
            {active === "Identity" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <Card className="rounded-2xl border-border/40 bg-background/50 shadow-none overflow-hidden">
                  <CardHeader className="p-6 pb-2">
                    <CardTitle className="text-xl font-bold">Official Identity</CardTitle>
                    <CardDescription className="text-sm">
                      These details identify you across permit applications and government reviews.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 p-6">
                    <Separator className="bg-border/40" />
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="full-name" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Full legal name</Label>
                        <Input
                          id="full-name"
                          value={formData.full_name}
                          onChange={handleInputChange}
                          placeholder="Enter your full legal name"
                          className="h-11 rounded-xl border-border/40 bg-background focus:ring-primary/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="account-type" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Account type</Label>
                        <Input id="account-type" value={formatRole(user?.role)} readOnly className="h-11 rounded-xl bg-muted/30 border-transparent" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="national-id" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">National ID / Registry No.</Label>
                        <Input id="national-id" placeholder="Verified by the authority" readOnly className="h-11 rounded-xl bg-muted/30 border-transparent" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="municipality" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Primary municipality</Label>
                        <Select defaultValue="casablanca">
                          <SelectTrigger id="municipality" className="h-11 w-full rounded-xl border-border/40 bg-background">
                            <SelectValue placeholder="Select municipality" />
                          </SelectTrigger>
                          <SelectContent align="start" className="rounded-xl">
                            <SelectItem value="casablanca">Casablanca</SelectItem>
                            <SelectItem value="rabat">Rabat</SelectItem>
                            <SelectItem value="marrakesh">Marrakesh</SelectItem>
                            <SelectItem value="tangier">Tangier</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border-border/40 bg-background/50 shadow-none overflow-hidden">
                  <CardHeader className="p-6 pb-2">
                    <CardTitle className="text-xl font-bold">Contact Information</CardTitle>
                    <CardDescription className="text-sm">
                      Used for application receipts, review notices, and authority follow-up.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 p-6">
                    <Separator className="bg-border/40" />
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Email address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="name@example.com"
                          className="h-11 rounded-xl border-border/40 bg-background"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Mobile number</Label>
                        <Input id="phone" type="tel" placeholder="+212 6 00 00 00 00" className="h-11 rounded-xl border-border/40 bg-background" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ── Organization ── */}
            {active === "Organization" && (
              <Card className="rounded-2xl border-border/40 bg-background/50 shadow-none overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                <CardHeader className="p-6 pb-2">
                  <CardTitle className="text-xl font-bold">Organization</CardTitle>
                  <CardDescription className="text-sm">
                    Details about your affiliated organization or agency.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <Separator className="bg-border/40" />
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="org-name" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Organization name</Label>
                      <Input id="org-name" placeholder="e.g. Commune de Casablanca" className="h-11 rounded-xl border-border/40 bg-background" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="org-type" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Organization type</Label>
                      <Select defaultValue="municipality">
                        <SelectTrigger id="org-type" className="h-11 w-full rounded-xl border-border/40 bg-background">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent align="start" className="rounded-xl">
                          <SelectItem value="municipality">Municipality</SelectItem>
                          <SelectItem value="agency">Government Agency</SelectItem>
                          <SelectItem value="firm">Private Firm</SelectItem>
                          <SelectItem value="individual">Individual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ── Security ── */}
            {active === "Security" && (
              <Card className="rounded-2xl border-border/40 bg-background/50 shadow-none overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                <CardHeader className="p-6 pb-2">
                  <CardTitle className="text-xl font-bold">Security</CardTitle>
                  <CardDescription className="text-sm">
                    Keep access to your government service account protected.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <Separator className="bg-border/40" />
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="new-password" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">New password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="••••••••"
                        className="h-11 rounded-xl border-border/40 bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Confirm new password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={formData.confirm_password}
                        onChange={(e) => setFormData(prev => ({ ...prev, confirm_password: e.target.value }))}
                        placeholder="••••••••"
                        className="h-11 rounded-xl border-border/40 bg-background"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row pt-4">
                    <Button type="button" variant="outline" className="h-11 gap-2 rounded-xl border-border/40 hover:bg-muted">
                      <KeyRound className="size-4" /> Manage two-factor authentication
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ── Notifications ── */}
            {active === "Notifications" && (
              <Card className="rounded-2xl border-border/40 bg-background/50 shadow-none overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                <CardHeader className="p-6 pb-2">
                  <CardTitle className="text-xl font-bold">Notifications</CardTitle>
                  <CardDescription className="text-sm">
                    Choose how Rokhas communicates important permit activity.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <Separator className="bg-border/40" />
                  <div className="space-y-0 rounded-2xl border border-border/40 bg-background overflow-hidden">
                    <div className="flex items-center justify-between p-4 px-6 hover:bg-muted/30 transition-colors">
                      <div className="space-y-0.5">
                        <Label htmlFor="status-emails" className="text-sm font-bold">Application status emails</Label>
                        <p className="text-xs text-muted-foreground">Receive approvals and rejection notices.</p>
                      </div>
                      <Switch id="status-emails" defaultChecked />
                    </div>
                    <Separator className="bg-border/40" />
                    <div className="flex items-center justify-between p-4 px-6 hover:bg-muted/30 transition-colors">
                      <div className="space-y-0.5">
                        <Label htmlFor="sms-alerts" className="text-sm font-bold">SMS alerts</Label>
                        <p className="text-xs text-muted-foreground">Time-sensitive reminders for inspections.</p>
                      </div>
                      <Switch id="sms-alerts" defaultChecked />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ── Language ── */}
            {active === "Language" && (
              <Card className="rounded-2xl border-border/40 bg-background/50 shadow-none overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                <CardHeader className="p-6 pb-2">
                  <CardTitle className="text-xl font-bold">Language & Display</CardTitle>
                  <CardDescription className="text-sm">
                    Set your preferred language and display mode.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <Separator className="bg-border/40" />
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="language" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Language</Label>
                      <Select defaultValue="en">
                        <SelectTrigger id="language" className="h-11 w-full rounded-xl border-border/40 bg-background">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent align="start" className="rounded-xl">
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="ar">Arabic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="theme" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Display mode</Label>
                      <Select
                        value={resolvedTheme === "dark" ? "dark" : "light"}
                        onValueChange={(v) => {
                          if (v) setTheme(v);
                        }}
                      >
                        <SelectTrigger id="theme" className="h-11 w-full rounded-xl border-border/40 bg-background">
                          <SelectValue placeholder="Select display mode" />
                        </SelectTrigger>
                        <SelectContent align="start" className="rounded-xl">
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Footer actions */}
            <div className="flex flex-col-reverse gap-4 pt-4 sm:flex-row sm:justify-between bottom-0 bg-background/80 backdrop-blur-md py-4 px-4 border-t border-border/40 mt-12 rounded-xl">
              <Button
                type="button"
                variant="outline"
                onClick={logout}
                className="h-12 gap-2 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive transition-all px-6 font-bold"
              >
                <LogOut className="size-4" /> Sign out
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                disabled={loading}
                className="h-12 min-w-[180px] rounded-xl text-base font-bold bg-primary text-primary-foreground hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {loading ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="size-5 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
