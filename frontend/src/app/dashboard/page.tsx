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

export default function DashboardPage() {
  const { token, user } = useAuth()
  const role = user?.role || "citizen"

  const [summary, setSummary] = React.useState<ReportSummary | null>(null)
  const [projects, setProjects] = React.useState<Project[]>([])
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
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
        if (token) toast.error("Impossible de charger les données du tableau de bord")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [token])

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
    economic: { label: "Économique", color: "var(--chart-4)" },
  }

  const pieData = [
    { name: "Approved", value: summary?.permits.approved || 0, fill: "var(--chart-2)" },
    { name: "Pending", value: summary?.permits.pending || 0, fill: "var(--chart-3)" },
    { name: "Rejected", value: Math.max(0, (summary?.permits.total || 0) - (summary?.permits.approved || 0) - (summary?.permits.pending || 0)), fill: "var(--chart-5)" },
  ]

  const pieConfig = {
    Approved: { label: "Approuvé", color: "var(--chart-2)" },
    Pending: { label: "En cours", color: "var(--chart-3)" },
    Rejected: { label: "Rejeté", color: "var(--chart-5)" },
  }

  const stats = {
    totalPermits: summary?.permits.total || 0,
    approvedRate: summary?.permits.approval_rate || 0,
    activeUsers: summary?.entities.citizens || 0,
    pendingEvaluations: summary?.entities.evaluations || 0
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
                  title={role === "architect" ? "Mes Soumissions" : "Activité de la Plateforme"}
                  description="Volume de dossiers déposés"
                  data={areaChartData}
                  config={areaChartConfig}
                  dataKeys={["building", "economic"]}
                />
              </div>
              <div className="lg:col-span-1">
                <ChartPieInteractive
                  title="État des Dossiers"
                  description="Répartition par statut"
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
          <div className="px-4 lg:px-6">
            <div className="bg-card rounded-2xl p-8 border border-border/40 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
              <h3 className="text-xl font-bold mb-2">Bienvenue sur Rokhas</h3>
              <p className="text-muted-foreground text-sm max-w-md">
                Gérez vos demandes d'urbanisme et d'autorisations économiques en toute simplicité.
              </p>
            </div>
          </div>
        )}

        <div className="px-4 lg:px-6">
          <div className="bg-card rounded-2xl border border-border/40 p-4 shadow-sm">
            <h3 className="text-lg font-bold mb-4 px-2">
              {role === "authority" ? "Tous les Dossiers" : "Mes Dossiers Récents"}
            </h3>
            <ProjectTable data={projects} />
          </div>
        </div>
      </div>
    </div>
  )
}
