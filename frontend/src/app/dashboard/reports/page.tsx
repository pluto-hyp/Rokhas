"use client";

import { useEffect, useState } from "react";
import { BarChart3, Download, TrendingUp, Users, FileText, CheckCircle2, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export default function ReportsPage() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    async function fetchReport() {
      if (!token) return;
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/reports/summary`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setReport(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, [token]);

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading reports...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Analytics & Reports</h1>
          <p className="text-muted-foreground mt-1">Detailed performance metrics and administrative insights.</p>
        </div>
        <Button className="rounded-xl gap-2 bg-primary text-primary-foreground">
          <Download className="w-4 h-4" />
          Export Data
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-border/40 shadow-none bg-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Approval Rate</p>
                <p className="text-3xl font-black mt-2">{report?.permits.approval_rate.toFixed(1)}%</p>
              </div>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/40 shadow-none bg-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Total Citizens</p>
                <p className="text-3xl font-black mt-2">{report?.entities.citizens}</p>
              </div>
              <div className="p-2 rounded-xl bg-primary/5 text-primary">
                <Users className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/40 shadow-none bg-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Total Permits</p>
                <p className="text-3xl font-black mt-2">{report?.permits.total}</p>
              </div>
              <div className="p-2 rounded-xl bg-primary/5 text-primary">
                <FileText className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/40 shadow-none bg-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Evaluations</p>
                <p className="text-3xl font-black mt-2">{report?.entities.evaluations}</p>
              </div>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                <Star className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/40 shadow-none bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Category Distribution</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {Object.entries(report?.categories || {}).map(([cat, count]: any) => (
                <div key={cat} className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-muted-foreground uppercase tracking-wider">{cat}</span>
                    <span>{count}</span>
                  </div>
                  <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary" 
                      style={{ width: `${(count / report.permits.total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 shadow-none bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-bold">System Health</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">API Services</p>
                  <p className="text-xs text-muted-foreground">Operating normally (99.9% uptime)</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Database Clusters</p>
                  <p className="text-xs text-muted-foreground">Optimal performance</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Agent Microservice</p>
                  <p className="text-xs text-muted-foreground">Ready for compliance checks</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
