"use client";

import { useEffect, useState } from "react";
import { Building2, Search, Plus, Filter, MoreHorizontal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    async function fetchBusinesses() {
      if (!token) return;
      try {
        const response = await fetch(`${API_URL}/api/v1/businesses/`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setBusinesses(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchBusinesses();
  }, [token]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Businesses</h1>
          <p className="text-muted-foreground mt-1">Manage local business licenses and commercial registrations.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search businesses..." className="pl-10 rounded-xl" />
          </div>
          <Button className="rounded-xl bg-primary text-primary-foreground gap-2">
            <Plus className="w-4 h-4" />
            Register Business
          </Button>
        </div>
      </div>

      <Card className="border-border/40 shadow-none bg-white overflow-hidden">
        <div className="p-4 bg-muted/10 border-b border-border/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="rounded-lg gap-2 text-xs">
              <Filter className="w-3 h-3" />
              Filter
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">{businesses.length} businesses found</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-muted/30 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-6 py-4">Business Name</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Reg. Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {loading ? (
                [1, 2, 3].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-8 h-12 bg-muted/10" />
                  </tr>
                ))
              ) : businesses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-muted-foreground">
                    <Building2 className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>No businesses found.</p>
                  </td>
                </tr>
              ) : (
                businesses.map((biz) => (
                  <tr key={biz.id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-foreground">{biz.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-muted-foreground">{biz.type}</p>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-muted-foreground">
                      {new Date(biz.registration_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", biz.status === "Active" ? "text-emerald-500 border-emerald-500/20" : "text-amber-500 border-amber-500/20")}>
                        {biz.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
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
