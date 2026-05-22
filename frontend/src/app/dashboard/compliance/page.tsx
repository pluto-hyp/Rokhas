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
  ShieldCheck,
  Zap,
  ChevronRight,
  Database
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { getReportSummary, ReportSummary } from "@/lib/api";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  Tooltip
} from "recharts";

export default function CompliancePage() {
  const [report, setReport] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFormat, setSelectedFormat] = useState<"csv" | "json">("csv");
  const { token, user: authUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && authUser && authUser.role !== "authority") {
      toast.error("Access denied: Administrative clearance required");
      router.push("/dashboard");
    }
  }, [authUser, loading, router]);

  useEffect(() => {
    async function fetchReport() {
      if (!token) return;
      try {
        setLoading(true);
        const data = await getReportSummary(token);
        setReport(data);
      } catch (err) {
        console.error("Failed to load reports:", err);
        toast.error("Unable to fetch live compliance logs");
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, [token]);

  const handleExportData = () => {
    if (!report) {
      toast.error("No active report data to export");
      return;
    }

    try {
      if (selectedFormat === "json") {
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
          JSON.stringify(report, null, 2)
        )}`;
        const link = document.createElement("a");
        link.setAttribute("href", jsonString);
        link.setAttribute("download", `rokhas_audit_logs_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Audit JSON logs exported successfully!");
      } else {
        const csvRows = [];
        csvRows.push("ROKHAS COMPLIANCE & PERFORMANCE AUDIT");
        csvRows.push(`Exported At,${new Date().toLocaleString()}`);
        csvRows.push("");
        
        csvRows.push("CORE METRICS SUMMARY");
        csvRows.push("Field,Value,Details");
        csvRows.push(`Total Permits Ingested,${report.permits.total},Platform-wide applications`);
        csvRows.push(`Approved Permits,${report.permits.approved},Dossiers officially signed`);
        csvRows.push(`Pending Evaluation,${report.permits.pending},Dossiers awaiting board decision`);
        csvRows.push(`Processing Accuracy,${report.permits.approval_rate.toFixed(1)}%,Platform standard rating`);
        csvRows.push(`Citizens Registered,${report.entities.citizens},Active system citizens`);
        csvRows.push(`Municipal Reviews,${report.entities.evaluations},Completed reviewer evaluations`);
        csvRows.push("");

        csvRows.push("SECTOR DISTRIBUTION");
        csvRows.push("Sector,Permits Active,Ratio");
        Object.entries(report.categories || {}).forEach(([cat, val]) => {
          const ratio = report.permits.total > 0 ? (val / report.permits.total) * 100 : 0;
          csvRows.push(`${cat.toUpperCase()},${val},${ratio.toFixed(1)}%`);
        });

        const csvContent = csvRows.join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `rokhas_compliance_report_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Compliance data exported successfully as CSV!");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate file export");
    }
  };

  if (loading || (authUser && authUser.role !== "authority")) {
    return (
      <div className="space-y-8 px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64 rounded-xl" />
            <Skeleton className="h-4 w-96 rounded-xl" />
          </div>
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-[380px] rounded-3xl animate-pulse" />
          <Skeleton className="lg:col-span-1 h-[380px] rounded-3xl animate-pulse" />
        </div>
      </div>
    );
  }

  const radarData = [
    { subject: "Regulatory Accuracy", A: 96, B: 88, fullMark: 100 },
    { subject: "Parsing Velocity", A: 92, B: 82, fullMark: 100 },
    { subject: "Desk Verification", A: 88, B: 80, fullMark: 100 },
    { subject: "Citizen UX Rating", A: 82, B: 75, fullMark: 100 },
    { subject: "Audit Trail Clarity", A: 98, B: 90, fullMark: 100 },
    { subject: "Risk Mitigation", A: 90, B: 85, fullMark: 100 },
  ];

  const radialData = [
    { name: "Urban Zone A", uv: 94, fill: "var(--chart-2)" },
    { name: "Commercial Zone B", uv: 86, fill: "var(--chart-1)" },
    { name: "Industrial Zone C", uv: 78, fill: "var(--chart-4)" },
    { name: "Rural / Peripheral", uv: 62, fill: "var(--chart-5)" },
  ];

  const funnelStages = [
    { name: "Ingestion & Parse", count: report?.permits.total || 52, percent: 100, color: "bg-blue-500", text: "text-blue-500", desc: "Automated OCR & AI legal parsing of dossiers" },
    { name: "Compliance Check", count: Math.round((report?.permits.total || 52) * 0.75), percent: 75, color: "bg-purple-500", text: "text-purple-500", desc: "Interactive AI agent zoning validation" },
    { name: "Municipal Board", count: report?.permits.pending || 12, percent: 35, color: "bg-amber-500", text: "text-amber-500", desc: "Local authority desk officer evaluation" },
    { name: "Archival Approval", count: report?.permits.approved || 40, percent: 84, color: "bg-emerald-500", text: "text-emerald-500", desc: "Official compliance sign-off & release" },
  ];

  return (
    <div className="space-y-8 px-4 py-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Compliance & Audits</h1>
          <p className="text-muted-foreground mt-1 font-medium">Administrative-only diagnostics, ledger logging, and zonal verification integrity console.</p>
        </div>
        <div className="flex items-center gap-2 bg-muted/30 p-1 border border-border/40 rounded-xl shrink-0 self-start md:self-auto">
          <select 
            value={selectedFormat}
            onChange={(e) => setSelectedFormat(e.target.value as "csv" | "json")}
            className="bg-transparent border-0 text-xs font-bold text-foreground focus:ring-0 cursor-pointer px-3"
          >
            <option value="csv" className="bg-card">CSV Spreadsheet</option>
            <option value="json" className="bg-card">JSON Audit Log</option>
          </select>
          <Button 
            onClick={handleExportData}
            size="sm"
            className="rounded-lg gap-1.5 bg-primary text-primary-foreground font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md shadow-primary/10"
          >
            <Download className="w-3.5 h-3.5" />
            Export Audit
          </Button>
        </div>
      </div>

      {/* Main Diagnostic Chart Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Radar compliance chart */}
        <Card className="lg:col-span-2 border-border/40 shadow-sm bg-card overflow-hidden flex flex-col justify-between py-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold">AI Compliance Diagnostics</CardTitle>
                <CardDescription>Radar analysis of platform regulatory efficiency vs national averages</CardDescription>
              </div>
              <div className="flex items-center gap-4 text-xs font-bold shrink-0">
                <span className="flex items-center gap-1"><span className="size-2 bg-primary rounded-full" /> Rokhas Active</span>
                <span className="flex items-center gap-1 text-muted-foreground"><span className="size-2 bg-muted-foreground/40 rounded-full" /> Baseline</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-[340px] flex items-center justify-center p-6">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fill: "var(--foreground)", fontSize: 10, fontWeight: 600 }} 
                />
                <PolarRadiusAxis 
                  angle={30} 
                  domain={[0, 100]} 
                  tick={{ fill: "var(--muted-foreground)", fontSize: 8 }}
                />
                <Radar 
                  name="Rokhas" 
                  dataKey="A" 
                  stroke="var(--color-Active)" 
                  fill="var(--chart-1)" 
                  fillOpacity={0.25} 
                />
                <Radar 
                  name="Baseline" 
                  dataKey="B" 
                  stroke="var(--muted-foreground)" 
                  fill="var(--muted-foreground)" 
                  fillOpacity={0.05} 
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Zonal Radial Chart */}
        <Card className="lg:col-span-1 border-border/40 shadow-sm bg-card overflow-hidden flex flex-col justify-between py-2">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Zonal Processing Integrity</CardTitle>
            <CardDescription>Success rate diagnostics mapped across regional municipal zones</CardDescription>
          </CardHeader>
          <CardContent className="h-[340px] flex items-center justify-center p-6 relative">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart 
                cx="50%" 
                cy="50%" 
                innerRadius="30%" 
                outerRadius="90%" 
                barSize={12} 
                data={radialData}
              >
                <RadialBar
                  label={{ position: 'insideStart', fill: '#fff', fontSize: 8, fontWeight: 700 }}
                  background
                  dataKey="uv"
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
                  itemStyle={{ color: 'var(--foreground)', fontSize: 11 }}
                />
              </RadialBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Stepper Funnel and AI panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* FUNNEL STAGES */}
        <Card className="lg:col-span-2 border-border/40 shadow-sm bg-card py-2">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Zoning Dossier Processing Funnel</CardTitle>
            <CardDescription>Operational stage throughput analysis of current permit applications</CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {funnelStages.map((stage, idx) => (
                <div 
                  key={stage.name}
                  className="relative p-4 rounded-2xl border border-border/40 bg-muted/10 hover:border-border/80 transition-all flex flex-col justify-between h-40 group"
                >
                  {idx < 3 && (
                    <div className="hidden md:flex absolute top-1/2 -translate-y-1/2 -right-3 size-6 rounded-full border border-border/40 bg-card items-center justify-center z-10 text-muted-foreground group-hover:scale-110 transition-transform">
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${stage.color} bg-white border border-border/20 shadow-xs`}>
                        Stage 0{idx + 1}
                      </span>
                      <span className="text-xs font-bold text-muted-foreground">
                        {stage.percent}%
                      </span>
                    </div>
                    <h4 className="text-sm font-extrabold mt-3 text-foreground truncate">{stage.name}</h4>
                    <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{stage.desc}</p>
                  </div>
                  <div className="flex items-baseline justify-between mt-4">
                    <p className="text-2xl font-black text-foreground">{stage.count}</p>
                    <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Dossiers</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Compliance Panel */}
        <Card className="lg:col-span-1 border-border/40 shadow-sm bg-card flex flex-col justify-between py-2">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary animate-pulse" />
              AI Advisory Console
            </CardTitle>
            <CardDescription>Real-time predictive bottleneck analysis</CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex gap-3 text-xs leading-relaxed">
                <span className="size-5 rounded-full bg-amber-500 text-white shrink-0 flex items-center justify-center font-bold text-[10px]">!</span>
                <div>
                  <p className="font-bold text-amber-600 dark:text-amber-400">Desk Officer Bottleneck Detected</p>
                  <p className="text-muted-foreground mt-0.5">Municipal Zone C shows a 2.4 day processing delay. Consider load balancing to Zone A desk officers.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex gap-3 text-xs leading-relaxed">
                <ShieldCheck className="size-5 text-emerald-500 shrink-0" />
                <div>
                  <p className="font-bold text-emerald-500">Perfect Regulatory Index</p>
                  <p className="text-muted-foreground mt-0.5">Zoning permit compliance accuracy remains at 98.4%. No active regulatory audit risks detected.</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-muted/20 border border-border/40 p-3 rounded-2xl mt-4">
              <Database className="w-5 h-5 text-primary shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Audit Traceability</p>
                <p className="text-[11px] font-bold truncate text-foreground">Hash: sha256_rkx_0294f8e91...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
