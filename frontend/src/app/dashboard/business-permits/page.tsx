"use client";

import { useEffect, useState } from "react";
import { Building2, Search, Plus, FileText, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { toast } from "sonner";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "/api/v1").replace(/\/+$/, "");

export default function BusinessPermitsPage() {
  const [permits, setPermits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { token, user: authUser } = useAuth();
  const role = authUser?.role || "citizen";

  useEffect(() => {
    async function fetchPermits() {
      if (!token) {
        console.log("[DEBUG] No token available");
        return;
      }
      try {
        const url = `${API_BASE_URL}/business-permits`;
        console.log("[DEBUG] Fetching from:", url);
        console.log("[DEBUG] API_BASE_URL:", API_BASE_URL);
        console.log("[DEBUG] User role:", role);
        
        const response = await fetch(url, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        console.log("[DEBUG] Response status:", response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log("[DEBUG] Permits count:", data.length);
          console.log("[DEBUG] Permits:", data);
          setPermits(data);
        } else {
          const errorText = await response.text();
          console.error("[DEBUG] Error response:", response.status, errorText);
          toast.error(`Failed to load permits: ${response.status}`);
        }
      } catch (err) {
        console.error("[DEBUG] Exception:", err);
        toast.error("Failed to load business permits");
      } finally {
        setLoading(false);
      }
    }
    fetchPermits();
  }, [token, role]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return (
          <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold text-emerald-600 bg-emerald-100 border border-emerald-200">
            <CheckCircle2 className="size-3" /> Approved
          </span>
        );
      case "Rejected":
        return (
          <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold text-red-600 bg-red-100 border border-red-200">
            <AlertCircle className="size-3" /> Rejected
          </span>
        );
      case "Under Review":
        return (
          <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold text-blue-600 bg-blue-100 border border-blue-200">
            <Clock className="size-3" /> Under Review
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold text-amber-600 bg-amber-100 border border-amber-200">
            <AlertCircle className="size-3" /> Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 px-4 py-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Business Permits</h1>
          <p className="text-muted-foreground mt-1">
            {role === "citizen" || role === "architect"
              ? "Submit and track your business permit requests."
              : "Review and approve pending business permit requests."
            }
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search permits..." className="pl-10 rounded-xl" />
          </div>
          {(role === "citizen" || role === "architect") && (
            <Link href="/dashboard/business-permits/create">
              <Button className="rounded-xl bg-primary text-primary-foreground font-bold hover:scale-[1.02] active:scale-[0.98] transition-all gap-2 shadow-md">
                <Plus className="w-4 h-4" />
                New Permit Request
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Permits Table */}
      <Card className="border-border/40 shadow-none bg-card overflow-hidden">
        <div className="p-4 border-b border-border/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="rounded-lg gap-2 text-xs border-border/40">
              Filter
            </Button>
          </div>
          <p className="text-xs text-muted-foreground font-bold">{permits.length} permits found</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/40">
              <tr>
                <th className="px-6 py-4">Business Name</th>
                <th className="px-6 py-4">Business Type</th>
                <th className="px-6 py-4">Submitted</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {loading ? (
                [1, 2, 3].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-8 h-12 bg-muted/10" />
                  </tr>
                ))
              ) : permits.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-muted-foreground">
                    <Building2 className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p className="font-semibold text-sm">No business permits yet.</p>
                  </td>
                </tr>
              ) : (
                permits.map((permit) => (
                  <tr key={permit.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-foreground">{permit.business_name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-muted-foreground">{permit.business_type}</p>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      {new Date(permit.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(permit.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/dashboard/business-permits/${permit.id}`}>
                        <Button variant="outline" size="sm" className="gap-2 text-xs">
                          <FileText className="w-3 h-3" />
                          View Details
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
