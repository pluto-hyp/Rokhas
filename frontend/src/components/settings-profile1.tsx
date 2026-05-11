"use client";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface SettingsProfile1Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  className?: string;
}

function formatRole(role?: string | null) {
  if (!role) return "Not configured";
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export function SettingsProfile1({
  open,
  onOpenChange,
  className,
}: SettingsProfile1Props) {
  const { user } = useAuth();

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="account-profile-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onOpenChange(false);
        }
      }}
    >
      <Card
        className={cn(
          "max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-background shadow-xl",
          className
        )}
      >
        <CardHeader className="relative pr-12">
          <CardTitle id="account-profile-title" className="text-xl font-semibold">
            Account Profile
          </CardTitle>
          <CardDescription>
            Review the official details connected to your Rokhas government
            service account.
          </CardDescription>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Close account profile"
            onClick={() => onOpenChange(false)}
            className="absolute right-3 top-3 rounded-md"
          >
            <X className="size-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-semibold">Official identity</h3>
              <p className="text-sm text-muted-foreground">
                These fields are used on applications, permits, and authority
                reviews.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="profile-full-name">Full legal name</Label>
                <Input
                  id="profile-full-name"
                  defaultValue={user?.full_name ?? ""}
                  placeholder="Enter your full legal name"
                  className="h-10 rounded-md"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-role">Account type</Label>
                <Input
                  id="profile-role"
                  value={formatRole(user?.role)}
                  readOnly
                  className="h-10 rounded-md bg-muted/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-identifier">
                  National ID / Registry No.
                </Label>
                <Input
                  id="profile-identifier"
                  placeholder="Verified by the authority"
                  readOnly
                  className="h-10 rounded-md bg-muted/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-municipality">
                  Primary municipality
                </Label>
                <Select defaultValue="casablanca">
                  <SelectTrigger
                    id="profile-municipality"
                    className="h-10 w-full rounded-md bg-background"
                  >
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
          </div>

          <Separator />

          <div className="space-y-4">
            <div>
              <h3 className="text-base font-semibold">Contact information</h3>
              <p className="text-sm text-muted-foreground">
                Used for receipts, inspection updates, and permit decisions.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="profile-email">Email address</Label>
                <Input
                  id="profile-email"
                  type="email"
                  defaultValue={user?.email ?? ""}
                  placeholder="name@example.com"
                  className="h-10 rounded-md"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-phone">Mobile number</Label>
                <Input
                  id="profile-phone"
                  type="tel"
                  placeholder="+212 6 00 00 00 00"
                  className="h-10 rounded-md"
                />
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col-reverse gap-2 bg-background sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full rounded-md sm:w-auto"
          >
            Cancel
          </Button>
          <Button type="button" className="w-full rounded-md sm:w-auto">
            Save profile
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
