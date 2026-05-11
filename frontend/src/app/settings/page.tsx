"use client";

import {
  Bell,
  Building2,
  Globe2,
  KeyRound,
  LogOut,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";

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

type NavItem = "Identity" | "Organization" | "Security" | "Notifications" | "Language";

const navigation: { label: NavItem; icon: React.ElementType }[] = [
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
  const { user, logout } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const [active, setActive] = useState<NavItem>("Identity");

  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
      <section className="mx-auto max-w-7xl rounded-lg border border-border bg-background px-6 py-8 shadow-sm sm:px-9">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-semibold tracking-normal">Account Settings</h1>
          <p className="text-base text-muted-foreground">
            Manage your Rokhas government service profile, security, and permit communication preferences.
          </p>
        </div>

        <Separator className="mt-5" />

        <div className="grid gap-8 pt-4 md:grid-cols-[210px_minmax(0,760px)] lg:gap-16">
          {/* Sidebar nav */}
          <nav aria-label="Settings navigation">
            <ul className="flex gap-1 overflow-x-auto pb-2 md:block md:space-y-1 md:overflow-visible md:pb-0">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.label}>
                    <Button
                      type="button"
                      variant={active === item.label ? "default" : "ghost"}
                      className="h-10 w-full justify-start gap-2 rounded-md px-3 text-base font-normal"
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
          <div className="space-y-6">

            {/* ── Identity ── */}
            {active === "Identity" && (
              <>
                <Card className="rounded-lg bg-background shadow-none p-5">
                  <CardHeader className="px-0 pb-1">
                    <CardTitle className="text-xl font-semibold">Official Identity</CardTitle>
                    <CardDescription className="text-base">
                      These details identify you across permit applications and government reviews.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5 px-0">
                    <Separator />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="full-name">Full legal name</Label>
                        <Input id="full-name" defaultValue={user?.full_name ?? ""} placeholder="Enter your full legal name" className="h-10 rounded-md" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="account-type">Account type</Label>
                        <Input id="account-type" value={formatRole(user?.role)} readOnly className="h-10 rounded-md bg-muted/30" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="national-id">National ID / Registry No.</Label>
                        <Input id="national-id" placeholder="Verified by the authority" readOnly className="h-10 rounded-md bg-muted/30" />
                        <p className="text-sm text-muted-foreground">
                          Official identifiers are changed through identity verification, not account settings.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="municipality">Primary municipality</Label>
                        <Select defaultValue="casablanca">
                          <SelectTrigger id="municipality" className="h-10 w-full rounded-md bg-background">
                            <SelectValue placeholder="Select municipality" />
                          </SelectTrigger>
                          <SelectContent align="start">
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

                <Card className="rounded-lg bg-background shadow-none p-5">
                  <CardHeader className="px-0 pb-1">
                    <CardTitle className="text-xl font-semibold">Contact Information</CardTitle>
                    <CardDescription className="text-base">
                      Used for application receipts, review notices, and authority follow-up.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5 px-0">
                    <Separator />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input id="email" type="email" defaultValue={user?.email ?? ""} placeholder="name@example.com" className="h-10 rounded-md" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Mobile number</Label>
                        <Input id="phone" type="tel" placeholder="+212 6 00 00 00 00" className="h-10 rounded-md" />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="address">Service address</Label>
                        <Input id="address" placeholder="Street, district, city" className="h-10 rounded-md" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* ── Organization ── */}
            {active === "Organization" && (
              <Card className="rounded-lg bg-background shadow-none p-5">
                <CardHeader className="px-0 pb-1">
                  <CardTitle className="text-xl font-semibold">Organization</CardTitle>
                  <CardDescription className="text-base">
                    Details about your affiliated organization or agency.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 px-0">
                  <Separator />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="org-name">Organization name</Label>
                      <Input id="org-name" placeholder="e.g. Commune de Casablanca" className="h-10 rounded-md" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="org-type">Organization type</Label>
                      <Select defaultValue="municipality">
                        <SelectTrigger id="org-type" className="h-10 w-full rounded-md bg-background">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent align="start">
                          <SelectItem value="municipality">Municipality</SelectItem>
                          <SelectItem value="agency">Government Agency</SelectItem>
                          <SelectItem value="firm">Private Firm</SelectItem>
                          <SelectItem value="individual">Individual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="org-id">Registry number</Label>
                      <Input id="org-id" placeholder="Official registry number" className="h-10 rounded-md" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="org-address">Organization address</Label>
                      <Input id="org-address" placeholder="Street, city" className="h-10 rounded-md" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ── Security ── */}
            {active === "Security" && (
              <Card className="rounded-lg bg-background shadow-none p-5">
                <CardHeader className="px-0 pb-1">
                  <CardTitle className="text-xl font-semibold">Security</CardTitle>
                  <CardDescription className="text-base">
                    Keep access to your government service account protected.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 px-0">
                  <Separator />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current password</Label>
                      <Input id="current-password" type="password" placeholder="••••••••" className="h-10 rounded-md" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New password</Label>
                      <Input id="new-password" type="password" placeholder="••••••••" className="h-10 rounded-md" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm new password</Label>
                      <Input id="confirm-password" type="password" placeholder="••••••••" className="h-10 rounded-md" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row pt-2">
                    <Button type="button" variant="outline" className="h-10 gap-2 rounded-md">
                      <KeyRound className="size-4" /> Change password
                    </Button>
                    <Button type="button" variant="outline" className="h-10 gap-2 rounded-md">
                      <ShieldCheck className="size-4" /> Manage two-factor authentication
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ── Notifications ── */}
            {active === "Notifications" && (
              <Card className="rounded-lg bg-background shadow-none p-5">
                <CardHeader className="px-0 pb-1">
                  <CardTitle className="text-xl font-semibold">Notifications</CardTitle>
                  <CardDescription className="text-base">
                    Choose how Rokhas communicates important permit activity.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 px-0">
                  <Separator />
                  <div className="space-y-4 rounded-md border border-border p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <Label htmlFor="status-emails">Application status emails</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive approvals, rejection notices, and requests for additional documents.
                        </p>
                      </div>
                      <Switch id="status-emails" defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <Label htmlFor="sms-alerts">SMS alerts</Label>
                        <p className="text-sm text-muted-foreground">
                          Get time-sensitive reminders for inspections and payment deadlines.
                        </p>
                      </div>
                      <Switch id="sms-alerts" defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <Label htmlFor="review-alerts">Review updates</Label>
                        <p className="text-sm text-muted-foreground">
                          Be notified when an authority reviews or comments on your permit.
                        </p>
                      </div>
                      <Switch id="review-alerts" />
                    </div>
                    <Separator />
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <Label htmlFor="newsletter">Platform announcements</Label>
                        <p className="text-sm text-muted-foreground">
                          Occasional updates about new Rokhas features and regulation changes.
                        </p>
                      </div>
                      <Switch id="newsletter" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ── Language ── */}
            {active === "Language" && (
              <Card className="rounded-lg bg-background shadow-none p-5">
                <CardHeader className="px-0 pb-1">
                  <CardTitle className="text-xl font-semibold">Language & Display</CardTitle>
                  <CardDescription className="text-base">
                    Set your preferred language and display mode.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 px-0">
                  <Separator />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <Select defaultValue="en">
                        <SelectTrigger id="language" className="h-10 w-full rounded-md bg-background">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent align="start">
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="ar">Arabic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="theme">Display mode</Label>
                      <Select
                        value={resolvedTheme === "dark" ? "dark" : "light"}
                        onValueChange={(v) => setTheme(v)}
                      >
                        <SelectTrigger id="theme" className="h-10 w-full rounded-md bg-background">
                          <SelectValue placeholder="Select display mode" />
                        </SelectTrigger>
                        <SelectContent align="start">
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
            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-between p-5">
              <Button
                type="button"
                variant="outline"
                onClick={logout}
                className="h-10 gap-2 rounded-md border-destructive/30 text-destructive hover:bg-destructive/10"
              >
                <LogOut className="size-4" /> Sign out
              </Button>
              <Button type="button" className="h-10 min-w-[165px] rounded-md text-base">
                Save settings
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
