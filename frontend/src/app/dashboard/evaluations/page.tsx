"use client";

import { useEffect, useState } from "react";
import { Star, Search, Filter, MessageSquare, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");

export default function EvaluationsPage() {
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    async function fetchEvaluations() {
      if (!token) return;
      try {
        const response = await fetch(`${API_URL}/api/v1/evaluations/`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setEvaluations(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchEvaluations();
  }, [token]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Project Evaluations</h1>
          <p className="text-muted-foreground mt-1">Review feedback and performance scores for architectural submissions.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search evaluations..." className="pl-10 rounded-xl" />
          </div>
          <Button variant="outline" className="rounded-xl gap-2">
            <BarChart3 className="w-4 h-4" />
            Stats
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          [1, 2].map(i => (
            <Card key={i} className="animate-pulse border-border/40 shadow-none bg-white h-48" />
          ))
        ) : evaluations.length === 0 ? (
          <div className="col-span-full py-20 text-center text-muted-foreground">
            <Star className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No evaluations recorded yet.</p>
          </div>
        ) : (
          evaluations.map((ev) => (
            <Card key={ev.id} className="border-border/40 shadow-none bg-white">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-foreground">{ev.project_ref}</h3>
                    <p className="text-xs text-muted-foreground mt-1">Submitted on {new Date(ev.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded-lg">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    <span className="text-sm font-black text-amber-600">{ev.score.toFixed(1)}</span>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-muted/10 rounded-xl border border-border/40">
                  <div className="flex gap-3">
                    <MessageSquare className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                    <p className="text-sm text-muted-foreground italic">"{ev.comments}"</p>
                  </div>
                </div>
                <div className="mt-6 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">
                      EX
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">Expert Reviewer</span>
                  </div>
                  <Button variant="link" size="sm" className="text-primary text-xs font-bold p-0 h-auto">View Details</Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
