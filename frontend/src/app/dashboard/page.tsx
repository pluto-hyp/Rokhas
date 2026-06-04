"use client"

import * as React from "react"
import { useAuth } from "@/contexts/AuthContext"
import { getReportSummary, getProjects, ReportSummary, Project } from "@/lib/api"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { ChartPieInteractive } from "@/components/chart-pie-interactive"
import { ProjectTable } from "@/components/ProjectTable"
import { SectionCards } from "@/components/section-cards"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { Building2, ArrowUpRight, Plus, Clock, CheckCircle2 } from "lucide-react"

export default function DashboardPage() {
  const { token, user } = useAuth()
  const role = user?.role || "citizen"

  const [summary, setSummary] = React.useState<ReportSummary | null>(null)
  const [projects, setProjects] = React.useState<Project[]>([])
  const [permits, setPermits] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchData = async () => {
      if (!token) return
      try {
        setLoading(true)
        const [summaryData, projectsData] = await Promise.all([
          getReportSummary(token),
          getProjects(token)
        ])
        setSummary(summaryData)
        setProjects(projectsData)

        if (role === "citizen") {
          const permitsRes = await fetch("/api/v1/business-permits", {
            headers: { "Authorization": `Bearer ${token}` }
          })
          if (permitsRes.ok) {
            const permitsData = await permitsRes.json()
            setPermits(permitsData)
          }
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
        if (token) toast.error("Unable to load dashboard data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [token, role])

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-[300px] w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-[300px] rounded-2xl" />
          <Skeleton className="h-[300px] rounded-2xl" />
          <Skeleton className="h-[300px] rounded-2xl" />
        </div>
      </div>
    )
  }

  const areaChartData = [
    { date: "2024-04-01", building: 12, economic: 8 },
    { date: "2024-04-15", building: 24, economic: 15 },
    { date: "2024-05-01", building: 35, economic: 22 },
    { date: "2024-05-15", building: 42, economic: 30 },
    { date: "2024-06-01", building: 58, economic: 45 },
    { date: "2024-06-15", building: 65, economic: 52 },
  ]

  const areaChartConfig = {
    building: { label: "Construction", color: "var(--chart-1)" },
    economic: { label: "Economic", color: "var(--chart-4)" },
  }

  const pieData = [
    { name: "Approved", value: summary?.permits.approved || 0, fill: "var(--chart-2)" },
    { name: "Pending", value: summary?.permits.pending || 0, fill: "var(--chart-3)" },
    { name: "Rejected", value: Math.max(0, (summary?.permits.total || 0) - (summary?.permits.approved || 0) - (summary?.permits.pending || 0)), fill: "var(--chart-5)" },
  ]

  const pieConfig = {
    Approved: { label: "Approved", color: "var(--chart-2)" },
    Pending: { label: "Pending", color: "var(--chart-3)" },
    Rejected: { label: "Rejected", color: "var(--chart-5)" },
  }

  const stats = {
    totalPermits: Math.floor(summary?.permits.total || 0),
    approvedRate: Math.round(summary?.permits.approval_rate || 0),
    activeUsers: Math.floor(summary?.entities.citizens || 0),
    pendingEvaluations: Math.floor(summary?.entities.evaluations || 0)
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">

        <SectionCards stats={stats} />

        {(role === "architect" || role === "authority") && (
          <div className="px-4 lg:px-6">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <ChartAreaInteractive
                  title={role === "architect" ? "My Submissions" : "Platform Activity"}
                  description="Weekly dossier volume"
                  data={areaChartData}
                  config={areaChartConfig}
                  dataKeys={["building", "economic"]}
                />
              </div>
              <div className="lg:col-span-1">
                <ChartPieInteractive
                  title="Dossier Status"
                  description="Distribution by state"
                  data={pieData}
                  config={pieConfig}
                  dataKey="value"
                  nameKey="name"
                />
              </div>
            </div>
          </div>
        )}

        {role === "citizen" && (
          <div className="px-4 lg:px-6 space-y-6">
            {/* Header / Intro */}
            <div className="bg-card border border-border/40 rounded-3xl p-8 shadow-sm relative overflow-hidden">
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground mb-2">Welcome Back, {user?.full_name || "Citizen"}!</h2>
              <p className="text-muted-foreground max-w-xl text-sm leading-relaxed">
                Easily monitor your commercial and urban authorization dossiers. Submit new permit applications or track ongoing reviews directly from your portal.
              </p>
            </div>

            {/* Recent Business Permits Cards */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  My Business Projects
                </h3>
                <a href="/dashboard/business-permits/create">
                  <button className="text-xs font-bold flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground hover:scale-[1.02] active:scale-[0.98] transition-all rounded-xl shadow-md shadow-primary/10">
                    <Plus className="w-3.5 h-3.5" /> New Business Project
                  </button>
                </a>
              </div>

              {permits.length === 0 ? (
                <div className="bg-card rounded-2xl p-10 border border-border/40 text-center flex flex-col items-center justify-center">
                  <Building2 className="w-12 h-12 text-muted-foreground opacity-30 mb-3" />
                  <p className="font-semibold text-sm">No business permit requests submitted yet.</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm">Launch your first business authorization project using the button above.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {permits.slice(0, 3).map((permit) => {
                    const getStatusBadge = (status: string) => {
                      if (status === "Approved") {
                        return (
                          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20">
                            <CheckCircle2 className="size-3" /> Approved
                          </span>
                        );
                      }
                      if (status === "Pending") {
                        return (
                          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20">
                            <Clock className="size-3" /> Pending
                          </span>
                        );
                      }
                      return (
                        <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-blue-500 bg-blue-500/10 border border-blue-500/20">
                          <Clock className="size-3" /> Under Review
                        </span>
                      );
                    };

                    return (
                      <div key={permit.id} className="bg-card border border-border/40 hover:border-primary/30 rounded-2xl p-5 hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="p-3 bg-muted rounded-xl text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                              <Building2 className="w-5 h-5" />
                            </div>
                            {getStatusBadge(permit.status)}
                          </div>
                          <div>
                            <h4 className="font-bold text-base line-clamp-1 group-hover:text-primary transition-colors">{permit.business_name}</h4>
                            <p className="text-xs text-muted-foreground mt-0.5 capitalize">{permit.business_type} Permit</p>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 h-8 leading-normal">{permit.business_description || "Commercial business operations."}</p>
                        </div>
                        <div className="mt-5 pt-4 border-t border-border/40 flex items-center justify-between">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            ID: PERMIT-{permit.id}
                          </span>
                          <a href={`/dashboard/business-permits/${permit.id}`} className="inline-flex items-center gap-1 text-xs font-bold text-primary group-hover:underline">
                            Details <ArrowUpRight className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {(role === "architect" || role === "authority") && (
          <div className="px-4 lg:px-6">
            <div className="bg-card rounded-2xl border border-border/40 p-4 shadow-sm">
              <h3 className="text-lg font-bold mb-4 px-2">
                {role === "authority" ? "Global Dossiers" : "My Recent Dossiers"}
              </h3>
              <ProjectTable data={projects} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
