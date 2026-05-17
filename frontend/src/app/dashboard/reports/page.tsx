"use client";

import { useEffect, useState } from "react";
import { 
  Download, 
  TrendingUp, 
  Users, 
  FileText, 
  CheckCircle2, 
  Star,
  Activity,
  ArrowUpRight,
  Clock,
  Briefcase
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { getReportSummary, getProjects, ReportSummary, Project } from "@/lib/api";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

export default function ReportsPage() {
  const [report, setReport] = useState<ReportSummary | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { token, user: authUser } = useAuth();
  const role = authUser?.role || "citizen";

  useEffect(() => {
    async function loadData() {
      if (!token) return;
      try {
        setLoading(true);
        const [reportData, projectsData] = await Promise.all([
          getReportSummary(token).catch(() => null),
          getProjects(token).catch(() => [])
        ]);
        setReport(reportData);
        setProjects(projectsData);
      } catch (err) {
        console.error("Failed to load reports summary:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [token]);

  
  const myTotal = projects.length;
  const myApproved = projects.filter(p => p.status === "Approved").length;
  const myPending = projects.filter(p => p.status === "Pending" || p.status === "Submitted").length;
  const mySuccessRate = myTotal > 0 ? (myApproved / myTotal) * 100 : 0;

  
  const handleExportData = () => {
    try {
      const csvRows = [];
      csvRows.push("ROKHAS PERFORMANCE & METRICS EXPORT");
      csvRows.push(`Exported By,${authUser?.full_name || "User"} (${role.toUpperCase()})`);
      csvRows.push(`Export Date,${new Date().toLocaleString()}`);
      csvRows.push("");

      if (role === "citizen" || role === "architect") {
        csvRows.push("PERSONAL DOSSIER ANALYTICS");
        csvRows.push("Metric,Value");
        csvRows.push(`Total Submissions,${myTotal}`);
        csvRows.push(`Approved Permits,${myApproved}`);
        csvRows.push(`Pending Review,${myPending}`);
        csvRows.push(`Approval Success Rate,${mySuccessRate.toFixed(1)}%`);
        csvRows.push("");

        csvRows.push("MY DOSSIERS LIST");
        csvRows.push("Ref No.,Title,Type,Status,Submitted At");
        projects.forEach((p) => {
          csvRows.push(`RKH-2026-${p.id.toString().padStart(4, '0')},"${p.title}",${p.type || "N/A"},${p.status},${new Date(p.created_at).toLocaleDateString()}`);
        });
      } else {
        if (!report) return;
        csvRows.push("GLOBAL PLATFORM STATISTICS");
        csvRows.push("Metric,Value");
        csvRows.push(`Total Permits Ingested,${report.permits.total}`);
        csvRows.push(`Approved Permits,${report.permits.approved}`);
        csvRows.push(`Pending Permits,${report.permits.pending}`);
        csvRows.push(`Global Approval Rate,${report.permits.approval_rate.toFixed(1)}%`);
        csvRows.push(`Total Registered Citizens,${report.entities.citizens}`);
        csvRows.push("");

        csvRows.push("PERMIT SECTORS BREAKDOWN");
        csvRows.push("Sector,Total count");
        Object.entries(report.categories || {}).forEach(([cat, val]) => {
          csvRows.push(`${cat.toUpperCase()},${val}`);
        });
      }

      const csvContent = csvRows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `rokhas_performance_metrics_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Performance logs successfully exported as CSV!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to build metrics export sheet");
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64 rounded-xl" />
            <Skeleton className="h-4 w-96 rounded-xl" />
          </div>
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl animate-pulse" />
          ))}
        </div>
        <Skeleton className="h-[350px] w-full rounded-2xl animate-pulse" />
      </div>
    );
  }

  
  const composedData = [
    { name: "Jan", duration: 19, dossiers: 6 },
    { name: "Feb", duration: 15, dossiers: 14 },
    { name: "Mar", duration: 11, dossiers: 22 },
    { name: "Apr", duration: 8, dossiers: 32 },
    { name: "May", duration: 6, dossiers: report?.permits.total || 45 },
  ];

  return (
    <div className="space-y-8 px-4 py-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Analytics</h1>
          <p className="text-muted-foreground mt-1 font-medium">
            {role === "authority" 
              ? "Global administrative dashboard activity logs, municipal velocity, and operational trends."
              : "Personal submission diagnostics, review speeds, and application success indicators."
            }
          </p>
        </div>
        <Button 
          onClick={handleExportData}
          className="rounded-xl gap-2 bg-primary text-primary-foreground font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md shadow-primary/10 self-start md:self-auto"
        >
          <Download className="w-4 h-4" />
          Export Performance CSV
        </Button>
      </div>

      {/* Dynamic Cards Grid (Based on active role) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {role === "authority" ? (
          <>
            <Card className="border-border/40 shadow-sm bg-card hover:border-border/80 transition-all">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Platform Success</p>
                    <p className="text-3xl font-extrabold text-foreground">{report?.permits.approval_rate.toFixed(1)}%</p>
                    <p className="text-[10px] font-bold text-emerald-500 flex items-center gap-0.5">
                      <TrendingUp className="w-3 h-3" />
                      +2.4% vs last month
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/40 shadow-sm bg-card hover:border-border/80 transition-all">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Active Citizens</p>
                    <p className="text-3xl font-extrabold text-foreground">{report?.entities.citizens}</p>
                    <p className="text-[10px] font-semibold text-muted-foreground">Registered citizens</p>
                  </div>
                  <div className="p-3 rounded-xl bg-primary/10 text-primary">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/40 shadow-sm bg-card hover:border-border/80 transition-all">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Global Submissions</p>
                    <p className="text-3xl font-extrabold text-foreground">{report?.permits.total}</p>
                    <p className="text-[10px] font-semibold text-muted-foreground">Platform dossiers</p>
                  </div>
                  <div className="p-3 rounded-xl bg-primary/10 text-primary">
                    <FileText className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/40 shadow-sm bg-card hover:border-border/80 transition-all">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Average Latency</p>
                    <p className="text-3xl font-extrabold text-foreground">6.2 Days</p>
                    <p className="text-[10px] font-bold text-emerald-500 flex items-center gap-0.5">
                      <Clock className="w-3.5 h-3.5" />
                      -1.8 days process time
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card className="border-border/40 shadow-sm bg-card hover:border-border/80 transition-all">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">My Submissions</p>
                    <p className="text-3xl font-extrabold text-foreground">{myTotal}</p>
                    <p className="text-[10px] font-semibold text-muted-foreground">Dossiers submitted by me</p>
                  </div>
                  <div className="p-3 rounded-xl bg-primary/10 text-primary">
                    <Briefcase className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/40 shadow-sm bg-card hover:border-border/80 transition-all">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Approved Permits</p>
                    <p className="text-3xl font-extrabold text-foreground">{myApproved}</p>
                    <p className="text-[10px] font-bold text-emerald-500 flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3" />
                      Clearance release granted
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/40 shadow-sm bg-card hover:border-border/80 transition-all">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Awaiting Review</p>
                    <p className="text-3xl font-extrabold text-foreground">{myPending}</p>
                    <p className="text-[10px] font-semibold text-muted-foreground">Under active desk evaluation</p>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
                    <Activity className="w-5 h-5 animate-pulse" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/40 shadow-sm bg-card hover:border-border/80 transition-all">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">My Success Rate</p>
                    <p className="text-3xl font-extrabold text-foreground">{mySuccessRate.toFixed(0)}%</p>
                    <p className="text-[10px] font-semibold text-muted-foreground">Approved submission ratio</p>
                  </div>
                  <div className="p-3 rounded-xl bg-primary/10 text-primary">
                    <Star className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* UNIQUE CHART SECTION: Processing Speed Composed Chart */}
      <Card className="border-border/40 shadow-sm bg-card">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Submission Velocity & Processing Duration</CardTitle>
          <CardDescription>Monthly comparison of active dossiers processed against mean response times (in days)</CardDescription>
        </CardHeader>
        <CardContent className="h-[350px] p-6 pt-0">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={composedData} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fill: "var(--foreground)", fontSize: 11, fontWeight: 600 }} />
              <YAxis yAxisId="left" tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} label={{ value: 'Dossiers Processed', angle: -90, position: 'insideLeft', style: { fill: 'var(--muted-foreground)', fontSize: 11, fontWeight: 600 } }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} label={{ value: 'Response Time (Days)', angle: 90, position: 'insideRight', style: { fill: 'var(--muted-foreground)', fontSize: 11, fontWeight: 600 } }} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} />
              <Legend verticalAlign="top" height={36} />
              <Bar yAxisId="left" dataKey="dossiers" name="Total Submissions" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="duration" name="Average Processing Duration" stroke="var(--chart-2)" strokeWidth={3} dot={{ strokeWidth: 2, r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Sector progress breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Category distribution */}
        <Card className="lg:col-span-2 border-border/40 shadow-sm bg-card">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Sectors & Regulation Classes</CardTitle>
            <CardDescription>Visual ratio of urban permit applications currently processed by category</CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-6">
            {Object.entries(report?.categories || { building: 15, economic: 25 }).map(([cat, count]: any) => {
              const totalPermits = report?.permits.total || 40;
              const percentage = (count / totalPermits) * 100;
              return (
                <div key={cat} className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-muted-foreground uppercase tracking-wider">{cat} permit dossiers</span>
                    <span className="text-foreground">{percentage.toFixed(0)}% of platform volume ({count} items)</span>
                  </div>
                  <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        cat === "building" ? "bg-primary" : "bg-chart-4"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Dynamic Helpful panel */}
        <Card className="lg:col-span-1 border-border/40 shadow-sm bg-card flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Advisory & Guidelines</CardTitle>
            <CardDescription>Zoning regulations and compliance co-pilot feedback</CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-muted/10 border border-border/40 flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 shrink-0" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <strong>Building height restrictions:</strong> Ensure all urban dossiers within Zone A do not exceed 18 meters as per local master plan regulations.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-muted/10 border border-border/40 flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 shrink-0" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <strong>Economic clearances:</strong> Commercial activities inside Zone B require a certified environmental impact audit before sign-off.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-between mt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Star className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">Need Assistance?</p>
                  <p className="text-[10px] text-muted-foreground">Ask the compliance co-pilot</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground/60 hover:text-foreground cursor-pointer transition-colors" />
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
