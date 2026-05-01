"use client";

import { FormEvent, useEffect, useState } from "react";
import { 
  Plus, 
  Bell, 
  Calendar, 
  FileText, 
  Clock, 
  CheckCircle2, 
  Users, 
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Building,
  Briefcase,
  Music,
  type LucideIcon
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { ApiError, createProject, getProjects, Project, ProjectCreate } from "@/lib/api";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");

type ReportSummary = {
  permits: {
    total: number;
    approved: number;
    pending: number;
    approval_rate: number;
  };
  entities: {
    citizens: number;
    businesses: number;
    evaluations: number;
  };
  categories: Record<string, number>;
};

const ACTIVITY_LOG = [
  { id: 1, type: "approved", text: "RKH-2026-0840 approved by Inspector Hassan", time: "2 minutes ago" },
  { id: 2, type: "submitted", text: "Youssef Bennani submitted new commercial permit", time: "1 hour ago" },
  { id: 3, type: "review", text: "RKH-2026-0839 document review completed", time: "3 hours ago" },
];

const FALLBACK_CATEGORIES = [
  { name: "Construction", value: 1420, color: "var(--primary)" },
  { name: "Business", value: 592, color: "oklch(0.556 0 0)" },
  { name: "Events", value: 313, color: "oklch(0.708 0 0)" },
  { name: "Other", value: 516, color: "oklch(0.87 0 0)" },
];

// --- Components ---

type StatCardProps = {
  title: string;
  value: string;
  trend: "up" | "down" | "none";
  trendValue: string;
  icon: LucideIcon;
  delay?: string;
};

const StatCard = ({ title, value, trend, trendValue, icon: Icon, delay = "" }: StatCardProps) => (
  <Card className={cn("relative overflow-hidden border border-border/40 shadow-none bg-card animate-appear", delay)}>
    <CardContent className="p-6">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
          <div className="flex items-center gap-1 mt-1">
            {trend === "up" ? (
              <TrendingUp className="w-3 h-3 text-foreground" />
            ) : trend === "down" ? (
              <TrendingDown className="w-3 h-3 text-destructive" />
            ) : null}
            <span className={cn(
              "text-[10px] font-bold",
              trend === "up" ? "text-foreground" : trend === "down" ? "text-destructive" : "text-muted-foreground"
            )}>
              {trendValue}
            </span>
            <span className="text-[10px] text-muted-foreground ml-1">this month</span>
          </div>
        </div>
        <div className="p-2 rounded-xl bg-muted text-foreground">
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const DonutChart = ({ data, total }: { data: typeof FALLBACK_CATEGORIES, total: string }) => {
  const totalValue = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-48">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          {data.map((item, i) => {
            const cumulativeValue = data.slice(0, i).reduce((acc, curr) => acc + curr.value, 0);
            const startAngle = (cumulativeValue / totalValue) * 360;
            const sliceAngle = (item.value / totalValue) * 360;
            
            const radius = 35;
            const circumference = 2 * Math.PI * radius;
            const strokeDasharray = `${(sliceAngle / 360) * circumference} ${circumference}`;
            const strokeDashoffset = -((startAngle / 360) * circumference);

            return (
              <circle
                key={i}
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke={item.color}
                strokeWidth="10"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-2xl font-black leading-none text-foreground">{total}</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Total</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-8 w-full">
        {data.map((item, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-xs font-medium text-muted-foreground">{item.name}</span>
            </div>
            <span className="text-xs font-bold text-foreground">{item.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function DashboardHome() {
  const { user, token, isLoading, logout } = useAuth();
  const role = user?.role || "citizen";
  const [projects, setProjects] = useState<Project[]>([]);
  const [report, setReport] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [permitOpen, setPermitOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState<ProjectCreate>({
    title: "",
    description: "",
    type: "Construction Permit",
    zone: "Residential",
    hauteur: 8,
    recul: 4,
    emprise: 0.45,
    surface_terrain: 350,
  });

  const fetchDashboardData = async (authToken: string) => {
    const [projectData, reportResponse] = await Promise.all([
      getProjects(authToken),
      fetch(`${API_URL}/api/v1/reports/summary`, {
        headers: { Authorization: `Bearer ${authToken}` },
      }),
    ]);
    return {
      projectData,
      reportData: reportResponse.ok ? await reportResponse.json() as ReportSummary : null,
    };
  };

  useEffect(() => {
    async function loadDashboardData() {
      if (isLoading) return;
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { projectData, reportData } = await fetchDashboardData(token);
        setProjects(projectData);
        setReport(reportData);
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          logout();
          return;
        }
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [isLoading, token, logout]);

  const onFormChange = (field: keyof ProjectCreate, value: string) => {
    const numericFields = ["hauteur", "recul", "emprise", "surface_terrain"];
    setForm((current) => ({
      ...current,
      [field]: numericFields.includes(field) ? Number(value) : value,
    }));
  };

  const handleCreatePermit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;
    if (!form.title.trim()) {
      setFormError("Permit title is required.");
      return;
    }

    setSubmitting(true);
    setFormError("");
    try {
      const created = await createProject(form, token);
      setProjects((current) => [created, ...current]);
      setPermitOpen(false);
      setForm((current) => ({ ...current, title: "", description: "" }));
      const { projectData, reportData } = await fetchDashboardData(token);
      setProjects(projectData);
      setReport(reportData);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        logout();
        return;
      }
      setFormError(error instanceof Error ? error.message : "Could not create permit.");
    } finally {
      setSubmitting(false);
    }
  };

  const recentProjects = projects.slice(0, 6);
  const approvedCount = report?.permits.approved ?? projects.filter((project) => project.status === "Approved").length;
  const pendingCount = report?.permits.pending ?? projects.filter((project) => project.status === "Pending").length;
  const totalPermits = report?.permits.total ?? projects.length;
  const reviewCount = projects.filter((project) => project.status === "In Review").length;
  const categories = report?.categories
    ? Object.entries(report.categories).map(([name, value], index) => ({
        name,
        value,
        color: ["var(--primary)", "oklch(0.556 0 0)", "oklch(0.708 0 0)", "oklch(0.87 0 0)", "oklch(0.42 0 0)"][index % 5],
      }))
    : FALLBACK_CATEGORIES;

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-border/40 rounded-xl shadow-none cursor-pointer hover:bg-muted/50 transition-colors">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Apr 2026</span>
          </div>
          <Button variant="outline" size="icon" className="rounded-xl border-border/40 bg-white">
            <Bell className="w-4 h-4" />
          </Button>
          <Button onClick={() => setPermitOpen(true)} className="rounded-xl bg-primary text-primary-foreground gap-2 px-6 shadow-sm">
            <Plus className="w-4 h-4" />
            <span className="font-bold">New Permit</span>
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {role === "authority" ? (
          <>
            <StatCard title="Total Permits" value={totalPermits.toLocaleString()} trend="up" trendValue={`${projects.length} loaded`} icon={FileText} />
            <StatCard title="Pending Review" value={(pendingCount + reviewCount).toLocaleString()} trend="down" trendValue={`${reviewCount} in review`} icon={Clock} delay="delay-100" />
            <StatCard title="Approved" value={approvedCount.toLocaleString()} trend="up" trendValue={`${(report?.permits.approval_rate ?? 0).toFixed(1)}%`} icon={CheckCircle2} delay="delay-200" />
            <StatCard title="Active Citizens" value={(report?.entities.citizens ?? 0).toLocaleString()} trend="up" trendValue={`${report?.entities.businesses ?? 0} businesses`} icon={Users} delay="delay-300" />
          </>
        ) : role === "architect" ? (
          <>
            <StatCard title="Client Projects" value={projects.length.toLocaleString()} trend="up" trendValue={`${recentProjects.length} recent`} icon={Users} />
            <StatCard title="Pending Submissions" value={pendingCount.toLocaleString()} trend="down" trendValue={`${reviewCount} in review`} icon={Clock} delay="delay-100" />
            <StatCard title="Approved Plans" value={approvedCount.toLocaleString()} trend="up" trendValue={`${totalPermits ? Math.round((approvedCount / totalPermits) * 100) : 0}%`} icon={CheckCircle2} delay="delay-200" />
            <StatCard title="Upcoming Deadlines" value={reviewCount.toLocaleString()} trend="up" trendValue="Active" icon={Calendar} delay="delay-300" />
          </>
        ) : (
          <>
            <StatCard title="My Applications" value={projects.length.toLocaleString()} trend="up" trendValue={`${recentProjects.length} recent`} icon={FileText} />
            <StatCard title="Under Review" value={(pendingCount + reviewCount).toLocaleString()} trend="none" trendValue={`${reviewCount} active`} icon={Clock} delay="delay-100" />
            <StatCard title="Issued Permits" value={approvedCount.toLocaleString()} trend="up" trendValue={`${totalPermits ? Math.round((approvedCount / totalPermits) * 100) : 0}%`} icon={CheckCircle2} delay="delay-200" />
            <StatCard title="Notifications" value={projects.filter((project) => project.ai_analysis).length.toLocaleString()} trend="up" trendValue="AI notes" icon={Bell} delay="delay-300" />
          </>
        )}
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border border-border/40 shadow-none bg-white overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 pb-4">
            <CardTitle className="text-lg font-bold">Recent Permit Applications</CardTitle>
            <Button variant="link" className="text-primary font-bold text-xs p-0 h-auto">View all</Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-muted/30 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4">Ref No.</th>
                    <th className="px-6 py-4">Applicant</th>
                    <th className="px-6 py-4">Permit Type</th>
                    <th className="px-6 py-4">Submitted</th>
                    <th className="px-6 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-sm text-muted-foreground">Loading permit applications...</td>
                    </tr>
                  ) : recentProjects.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-sm text-muted-foreground">No permit applications yet.</td>
                    </tr>
                  ) : recentProjects.map((app) => (
                    <tr key={app.id} className="hover:bg-muted/20 transition-colors cursor-pointer group">
                      <td className="px-6 py-4 text-xs font-bold text-muted-foreground">RKH-2026-{app.id.toString().padStart(4, "0")}</td>
                      <td className="px-6 py-4 text-sm font-bold text-foreground">{user?.full_name || "Current User"}</td>
                      <td className="px-6 py-4 text-xs font-medium text-muted-foreground">{app.type || "Permit"}</td>
                      <td className="px-6 py-4 text-xs font-medium text-muted-foreground">{new Date(app.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right">
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "rounded-full px-3 py-1 text-[10px] font-bold border-border/40 bg-white",
                            app.status === "Approved" ? "text-foreground" :
                            app.status === "Pending" ? "text-muted-foreground" :
                            app.status === "In Review" ? "text-foreground/80" :
                            "text-muted-foreground/60"
                          )}
                        >
                          <div className={cn(
                            "w-1 h-1 rounded-full mr-2 inline-block",
                            app.status === "Approved" ? "bg-primary" : "bg-muted-foreground"
                          )} />
                          {app.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/40 shadow-none bg-white">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 pb-4">
            <CardTitle className="text-lg font-bold">Permit Categories</CardTitle>
            <Button variant="ghost" size="sm" className="text-muted-foreground h-auto p-0">Details</Button>
          </CardHeader>
          <CardContent className="p-8">
            <DonutChart data={categories} total={totalPermits.toLocaleString()} />
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-border/40 shadow-none bg-white">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 pb-4">
            <CardTitle className="text-lg font-bold">Recent Activity</CardTitle>
            <Button variant="link" className="text-primary font-bold text-xs p-0 h-auto">View log</Button>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {ACTIVITY_LOG.map((activity) => (
                <div key={activity.id} className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center shrink-0">
                    {activity.type === 'approved' ? <CheckCircle2 className="w-5 h-5" /> : 
                     activity.type === 'submitted' ? <FileText className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground">{activity.text}</p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/40 shadow-none bg-white">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 pb-4">
            <CardTitle className="text-lg font-bold">Quick Services</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[
                { title: "Construction Permit", desc: "Residential & commercial", icon: Building },
                { title: "Business License", desc: "New registration & renewal", icon: Briefcase },
                { title: "Event Planning", desc: "Public & private gatherings", icon: Music },
              ].map((service, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white hover:bg-muted/10 transition-all cursor-pointer group border border-border/40">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center">
                      <service.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{service.title}</p>
                      <p className="text-xs text-muted-foreground">{service.desc}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Sheet open={permitOpen} onOpenChange={setPermitOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <form onSubmit={handleCreatePermit} className="flex min-h-full flex-col">
            <SheetHeader className="border-b border-border/40">
              <SheetTitle>New Permit</SheetTitle>
              <SheetDescription>Create a permit dossier and send it into the review queue.</SheetDescription>
            </SheetHeader>

            <div className="grid gap-5 p-4">
              <div className="grid gap-2">
                <Label htmlFor="permit-title">Title</Label>
                <Input
                  id="permit-title"
                  value={form.title}
                  onChange={(event) => onFormChange("title", event.target.value)}
                  placeholder="e.g. Villa extension in Rabat"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="permit-description">Description</Label>
                <textarea
                  id="permit-description"
                  value={form.description}
                  onChange={(event) => onFormChange("description", event.target.value)}
                  className="min-h-24 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  placeholder="Short context for reviewers"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="permit-type">Permit Type</Label>
                  <select
                    id="permit-type"
                    value={form.type}
                    onChange={(event) => onFormChange("type", event.target.value)}
                    className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <option>Construction Permit</option>
                    <option>Renovation Permit</option>
                    <option>Demolition Permit</option>
                    <option>Extension Permit</option>
                    <option>Business License</option>
                    <option>Event Permit</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="permit-zone">Zone</Label>
                  <select
                    id="permit-zone"
                    value={form.zone}
                    onChange={(event) => onFormChange("zone", event.target.value)}
                    className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <option>Residential</option>
                    <option>Commercial</option>
                    <option>Industrial</option>
                    <option>Mixed-use</option>
                    <option>Agricultural</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="permit-height">Height (m)</Label>
                  <Input id="permit-height" type="number" min="0" step="0.1" value={form.hauteur} onChange={(event) => onFormChange("hauteur", event.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="permit-setback">Setback (m)</Label>
                  <Input id="permit-setback" type="number" min="0" step="0.1" value={form.recul} onChange={(event) => onFormChange("recul", event.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="permit-footprint">Footprint</Label>
                  <Input id="permit-footprint" type="number" min="0" max="1" step="0.01" value={form.emprise} onChange={(event) => onFormChange("emprise", event.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="permit-surface">Surface (m2)</Label>
                  <Input id="permit-surface" type="number" min="0" step="1" value={form.surface_terrain} onChange={(event) => onFormChange("surface_terrain", event.target.value)} />
                </div>
              </div>

              {formError && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">{formError}</p>}
            </div>

            <SheetFooter className="border-t border-border/40">
              <Button type="submit" disabled={submitting} className="h-10 rounded-xl bg-primary text-primary-foreground">
                {submitting ? "Submitting..." : "Submit Permit"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
