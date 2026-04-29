"use client";

import { useState } from "react";
import { Search, FileText, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

export default function TrackPage() {
  const [ref, setRef] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  const handleSearch = async () => {
    if (!ref || !token) return;
    setLoading(true);
    try {
      // Assuming dossier ID is extracted from ref or ref is the ID for now
      // RKH-2026-0841 -> extract 841
      const id = ref.split('-').pop();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/dossiers/${id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setResult(data);
      } else {
        setResult({ error: "Application not found" });
      }
    } catch (err) {
      setResult({ error: "Failed to fetch application" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Track Application</h1>
        <p className="text-muted-foreground">Enter your permit reference number to check the current status.</p>
        <div className="flex gap-2 max-w-md mx-auto">
          <Input 
            placeholder="e.g. RKH-2026-0841" 
            value={ref} 
            onChange={(e) => setRef(e.target.value)}
            className="rounded-xl"
          />
          <Button onClick={handleSearch} disabled={loading} className="rounded-xl bg-primary text-primary-foreground">
            {loading ? "Searching..." : "Track"}
          </Button>
        </div>
      </div>

      {result && (
        <Card className="border-border/40 shadow-none bg-white overflow-hidden">
          {result.error ? (
            <CardContent className="p-12 text-center text-muted-foreground">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>{result.error}</p>
            </CardContent>
          ) : (
            <div className="divide-y divide-border/40">
              <div className="p-8 flex justify-between items-center bg-muted/10">
                <div>
                  <h2 className="text-2xl font-bold">{result.title}</h2>
                  <p className="text-sm text-muted-foreground mt-1">Ref: {ref}</p>
                </div>
                <Badge variant="outline" className="rounded-full px-4 py-1 text-xs font-bold bg-white">
                  <div className={cn("w-2 h-2 rounded-full mr-2 inline-block", result.status === "Approved" ? "bg-emerald-500" : "bg-amber-500")} />
                  {result.status}
                </Badge>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Basic Info</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Type</span>
                        <span className="font-bold">{result.type}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Zone</span>
                        <span className="font-bold">{result.zone}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Submitted</span>
                        <span className="font-bold">{new Date(result.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Technical Data</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Height</span>
                        <span className="font-bold">{result.hauteur} m</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Recul</span>
                        <span className="font-bold">{result.recul} m</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Application Progress</h3>
                  <div className="space-y-8 relative">
                    <div className="absolute left-4 top-4 bottom-4 w-px bg-border/40" />
                    <div className="flex gap-4 relative z-10">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">Submission Received</p>
                        <p className="text-xs text-muted-foreground">{new Date(result.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className={cn("flex gap-4 relative z-10", result.status !== "Pending" ? "opacity-100" : "opacity-40")}>
                      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", result.status !== "Pending" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">Technical Review</p>
                        <p className="text-xs text-muted-foreground">Processing</p>
                      </div>
                    </div>
                    <div className={cn("flex gap-4 relative z-10", result.status === "Approved" ? "opacity-100" : "opacity-40")}>
                      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", result.status === "Approved" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">Final Decision</p>
                        <p className="text-xs text-muted-foreground">{result.status === "Approved" ? "Approved" : "Pending"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
