"use client";

import { User, Shield, Bell, Globe, LogOut } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";

export default function SettingsPage() {
  const { user, logout } = useAuth();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account preferences and system configuration.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-2">
          <Button variant="ghost" className="w-full justify-start gap-3 bg-muted/50 rounded-xl font-bold">
            <User className="w-4 h-4" />
            Profile
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl text-muted-foreground">
            <Shield className="w-4 h-4" />
            Security
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl text-muted-foreground">
            <Bell className="w-4 h-4" />
            Notifications
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl text-muted-foreground">
            <Globe className="w-4 h-4" />
            Region & Language
          </Button>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card className="border-border/40 shadow-none bg-white">
            <CardHeader className="border-b border-border/40 pb-4">
              <CardTitle className="text-lg font-bold">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Full Name</label>
                  <Input defaultValue={user?.full_name ?? ""} className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Email Address</label>
                  <Input defaultValue={user?.email ?? ""} className="rounded-xl" />
                </div>
              </div>
              <div className="pt-4 flex justify-end">
                <Button className="rounded-xl bg-primary text-primary-foreground px-8 font-bold">Save Changes</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/40 shadow-none bg-white">
            <CardHeader className="border-b border-border/40 pb-4">
              <CardTitle className="text-lg font-bold">Preferences</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold">Email Notifications</p>
                  <p className="text-xs text-muted-foreground">Receive updates about your application status.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold">Dark Mode</p>
                  <p className="text-xs text-muted-foreground">Toggle between light and dark interface.</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <div className="pt-4">
            <Button variant="outline" onClick={logout} className="rounded-xl border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white transition-all gap-2 w-full font-bold">
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
