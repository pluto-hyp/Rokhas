"use client";

import { ComponentType, FormEvent, useEffect, useMemo, useState } from "react";
import {
  Activity,
  Bell,
  Building2,
  Calendar,
  CheckCircle2,
  Clock3,
  DollarSign,
  FileText,
  Plus,
  Search,
  Users,
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
import {
  ApiError,
  createProject,
  getProjects,
  getReportSummary,
  Project,
  ProjectCreate,
  ReportSummary,
} from "@/lib/api";

type Metric = {
  title: string;
  value: string;
  change: string;
  positive?: boolean;
  icon: ComponentType<{ className?: string }>;
};

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const classes =
    normalized === "approved"
      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
      : normalized === "in review"
        ? "bg-amber-100 text-amber-700 border-amber-200"
        : normalized === "pending"
          ? "bg-blue-100 text-blue-700 border-blue-200"
          : "bg-muted text-muted-foreground border-border";

  return (
    <Badge variant="outline" className={cn("capitalize border", classes)}>
      {status}
    </Badge>
  );
}

export default function DashboardHome() {
  const { user, token, isLoading, logout } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [report, setReport] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [permitOpen, setPermitOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [searchValue, setSearchValue] = useState("");
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
    const [projectData, reportData] = await Promise.all([
      getProjects(authToken),
      getReportSummary(authToken),
    ]);

    return {
      projectData,
      reportData,
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
        setProjects(Array.isArray(projectData) ? projectData : []);
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
    const numericFields = new Set(["hauteur", "recul", "emprise", "surface_terrain"]);
    setForm((current) => ({
      ...current,
      [field]: numericFields.has(field) ? Number(value) : value,
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
      await createProject(form, token);
      setPermitOpen(false);
      setForm((current) => ({ ...current, title: "", description: "" }));

      const { projectData, reportData } = await fetchDashboardData(token);
      setProjects(Array.isArray(projectData) ? projectData : []);
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

  const totalPermits = report?.permits.total ?? projects.length;
  const approvedCount =
    report?.permits.approved ?? projects.filter((project) => project.status === "Approved").length;
  const pendingCount =
    report?.permits.pending ?? projects.filter((project) => project.status === "Pending").length;
  const reviewCount = projects.filter((project) => project.status === "In Review").length;
  const categories = Object.entries(report?.categories ?? {});
  const topCategories = (categories.length > 0 ? categories : [["Construction", projects.length]]).slice(0, 4);
  const maxCategory = Math.max(...topCategories.map(([, value]) => Number(value)), 1);

  const metrics: Metric[] = useMemo(
    () => [
      {
        title: "Total permits",
        value: totalPermits.toLocaleString(),
        change: `${projects.length} loaded`,
        positive: true,
        icon: FileText,
      },
      {
        title: "Approved",
        value: approvedCount.toLocaleString(),
        change: `${(report?.permits.approval_rate ?? 0).toFixed(1)}% approval rate`,
        positive: true,
        icon: CheckCircle2,
      },
      {
        title: "In progress",
        value: (pendingCount + reviewCount).toLocaleString(),
        change: `${reviewCount} in review`,
        positive: false,
        icon: Clock3,
      },
      {
        title: "Citizens",
        value: (report?.entities.citizens ?? 0).toLocaleString(),
        change: `${report?.entities.businesses ?? 0} businesses`,
        positive: true,
        icon: Users,
      },
    ],
    [approvedCount, pendingCount, projects.length, report, reviewCount, totalPermits]
  );

  const filteredProjects = projects.filter((project) => {
    const q = searchValue.trim().toLowerCase();
    if (!q) return true;
    return [project.title, project.type, project.status].some((field) =>
      (field || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back{user?.full_name ? `, ${user.full_name}` : ""}</p>
          <h1 className="text-2xl font-semibold tracking-tight">CRM Dashboard</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Calendar className="h-4 w-4" />
            This month
          </Button>
          <Button variant="outline" size="icon">
            <Bell className="h-4 w-4" />
          </Button>
          <Button onClick={() => setPermitOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Permit
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardContent className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{metric.title}</span>
                <metric.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-3xl font-semibold">{metric.value}</p>
              <p className={cn("mt-1 text-xs", metric.positive ? "text-emerald-600" : "text-amber-600")}>
                {metric.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Permits Pipeline</CardTitle>
            <div className="relative w-full max-w-xs">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search permits..."
                className="pl-8"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {loading ? (
                <p className="py-10 text-center text-sm text-muted-foreground">Loading dashboard data...</p>
              ) : filteredProjects.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">No permits found.</p>
              ) : (
                filteredProjects.slice(0, 6).map((project) => (
                  <div
                    key={project.id}
                    className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium">{project.title || `Permit #${project.id}`}</p>
                      <p className="text-sm text-muted-foreground">
                        {project.type || "Permit"} • {new Date(project.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <StatusBadge status={project.status || "Pending"} />
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topCategories.map(([name, value]) => {
              const numericValue = Number(value) || 0;
              const width = Math.max(8, Math.round((numericValue / maxCategory) * 100));

              return (
                <div key={name} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{name}</span>
                    <span className="font-medium">{numericValue.toLocaleString()}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div className="h-2 rounded-full bg-primary" style={{ width: `${width}%` }} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Live Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { icon: Activity, label: "New permit submitted", time: "2m ago" },
              { icon: Building2, label: "Business profile updated", time: "34m ago" },
              { icon: DollarSign, label: "Permit fee paid", time: "1h ago" },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3 rounded-lg border p-3">
                <item.icon className="h-4 w-4 text-primary" />
                <p className="flex-1 text-sm">{item.label}</p>
                <span className="text-xs text-muted-foreground">{item.time}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="text-xl font-semibold">{pendingCount.toLocaleString()}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">In review</p>
              <p className="text-xl font-semibold">{reviewCount.toLocaleString()}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Evaluations</p>
              <p className="text-xl font-semibold">{(report?.entities.evaluations ?? 0).toLocaleString()}</p>
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
                  className="min-h-24 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
                  placeholder="Short context for reviewers"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="permit-type">Permit Type</Label>
                  <select
                    id="permit-type"
                    value={form.type}
                    onChange={(event) => onFormChange("type", event.target.value)}
                    className="h-10 rounded-md border border-border bg-background px-3 text-sm outline-none focus-visible:border-ring"
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
                    className="h-10 rounded-md border border-border bg-background px-3 text-sm outline-none focus-visible:border-ring"
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
                  <Input
                    id="permit-height"
                    type="number"
                    min="0"
                    step="0.1"
                    value={form.hauteur}
                    onChange={(event) => onFormChange("hauteur", event.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="permit-setback">Setback (m)</Label>
                  <Input
                    id="permit-setback"
                    type="number"
                    min="0"
                    step="0.1"
                    value={form.recul}
                    onChange={(event) => onFormChange("recul", event.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="permit-footprint">Footprint</Label>
                  <Input
                    id="permit-footprint"
                    type="number"
                    min="0"
                    max="1"
                    step="0.01"
                    value={form.emprise}
                    onChange={(event) => onFormChange("emprise", event.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="permit-surface">Surface (m2)</Label>
                  <Input
                    id="permit-surface"
                    type="number"
                    min="0"
                    step="1"
                    value={form.surface_terrain}
                    onChange={(event) => onFormChange("surface_terrain", event.target.value)}
                  />
                </div>
              </div>

              {formError && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">{formError}</p>}
            </div>

            <SheetFooter className="border-t border-border/40">
              <Button type="submit" disabled={submitting} className="h-10">
                {submitting ? "Submitting..." : "Submit Permit"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
