"use client";

import { useEffect, useState } from "react";
import { UserCircle, Search, Mail, Calendar, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");

export default function CitizensPage() {
  const [citizens, setCitizens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    async function fetchCitizens() {
      if (!token) return;
      try {
        const response = await fetch(`${API_URL}/api/v1/citizens/`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setCitizens(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchCitizens();
  }, [token]);

  return (
    <div className="space-y-8 px-4 py-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Citizens Portal</h1>
          <p className="text-muted-foreground mt-1">Directory of registered citizens and property owners.</p>
        </div>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search citizens..." className="pl-10 rounded-xl" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse border-border/40 shadow-none bg-white h-40" />
          ))
        ) : citizens.length === 0 ? (
          <div className="col-span-full py-20 text-center text-muted-foreground">
            <UserCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No citizens registered yet.</p>
          </div>
        ) : (
          citizens.map((citizen) => (
            <Card key={citizen.id} className="border-border/40 shadow-none bg-white hover:border-primary/40 transition-colors cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/5 text-primary flex items-center justify-center font-bold">
                    {citizen.full_name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground truncate">{citizen.full_name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground truncate">{citizen.email}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div className="mt-6 pt-6 border-t border-border/40 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Registered</p>
                    <p className="text-xs font-bold">{new Date(citizen.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Status</p>
                    <p className="text-xs font-bold text-emerald-500">Verified</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
