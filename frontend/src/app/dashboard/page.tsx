"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderOpen, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { getProjects, Project } from "@/lib/api";
import { useAuth, useUser } from "@clerk/nextjs";

export default function DashboardHome() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { getToken } = useAuth();
  const { user } = useUser();
  const role = user?.publicMetadata?.role as string || "citizen";

  useEffect(() => {
    async function loadData() {
      try {
        const token = await getToken();
        if (!token) return;
        const data = await getProjects(token);
        setProjects(data);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [getToken]);

  const stats = {
    total: projects.length,
    approved: projects.filter(p => p.status === "Approved").length,
    underReview: projects.filter(p => p.status === "Under Review").length,
    rejected: projects.filter(p => p.status === "Rejected").length,
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-serif font-bold tracking-tight capitalize">
          {role === "citizen" ? "My Workspace" : role === "architect" ? "Studio Overview" : "Municipal Portal"}
        </h2>
        <p className="text-muted-foreground mt-2">
          {role === "citizen" 
            ? "Welcome back. Here is a summary of your architectural projects." 
            : role === "architect" 
            ? "Monitor your clients' projects and submission deadlines." 
            : "Review pending dossiers and track urban development metrics."}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.total}</div>
            <p className="text-xs text-muted-foreground">Active dossiers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Permits</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.approved}</div>
            <p className="text-xs text-muted-foreground">Ready for construction</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Under Review</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.underReview}</div>
            <p className="text-xs text-muted-foreground">Pending municipal action</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Requires Action</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.rejected}</div>
            <p className="text-xs text-muted-foreground">Rejected or missing docs</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading activity...</p>
              ) : projects.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent activity.</p>
              ) : (
                projects.slice(0, 5).map((project) => (
                  <div key={project.id} className="flex items-center">
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">{project.title}</p>
                      <p className="text-sm text-muted-foreground">Status: {project.status}</p>
                    </div>
                    <div className="ml-auto font-medium text-xs text-muted-foreground">
                      {new Date(project.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Agent Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Your Rokhas AI Assistant has analyzed your recent submissions.
            </p>
            <div className="p-4 bg-primary/5 rounded-lg border border-border/40">
              <p className="text-sm font-medium italic">
                {projects.find(p => p.hauteur && p.hauteur > 15) 
                  ? "Note: Some of your projects exceed the standard height limit. Our agent recommends verifying the specific zone exceptions."
                  : "All your current projects appear to follow general height and setback regulations. Use the Agent Chat for specific questions."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
