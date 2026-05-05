"use client";

import { useEffect, useState } from "react";
import { ApiError, getProjects, Project } from "@/lib/api";
import { FileText, Search, Plus, Filter } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { token, isLoading, logout } = useAuth();

  useEffect(() => {
    async function loadProjects() {
      if (isLoading) return;
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await getProjects(token);
        setProjects(data);
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          logout();
          return;
        }
        console.error("Failed to load projects", error);
      } finally {
        setLoading(false);
      }
    }
    loadProjects();
  }, [isLoading, token, logout]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Permit Requests</h1>
          <p className="text-muted-foreground mt-1">Monitor and manage your active and archived permit applications.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search requests..." className="pl-10 rounded-xl" />
          </div>
          <Button className="rounded-xl bg-primary text-primary-foreground gap-2">
            <Plus className="w-4 h-4" />
            Submit New
          </Button>
        </div>
      </div>

      <Card className="border-border/40 shadow-none bg-white overflow-hidden">
        <div className="p-4 bg-muted/10 border-b border-border/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="rounded-lg gap-2 text-xs">
              <Filter className="w-3 h-3" />
              Filter
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">{projects.length} requests found</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-muted/30 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-6 py-4">Ref No.</th>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {loading ? (
                [1, 2, 3].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-8 h-12 bg-muted/10" />
                  </tr>
                ))
              ) : projects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>No permit requests found.</p>
                  </td>
                </tr>
              ) : (
                projects.map((project) => (
                  <tr key={project.id} className="hover:bg-muted/10 transition-colors cursor-pointer">
                    <td className="px-6 py-4">
                      <p className="text-xs font-bold text-muted-foreground">RKH-2026-{project.id.toString().padStart(4, '0')}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-foreground">{project.title}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-muted-foreground">{project.type || "N/A"}</p>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-muted-foreground">
                      {new Date(project.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Badge variant="outline" className={cn(
                        "rounded-full px-3 py-1 text-[10px] font-bold border-border/40 bg-white",
                        project.status === "Approved" ? "text-foreground" : "text-muted-foreground"
                      )}>
                        <div className={cn(
                          "w-1 h-1 rounded-full mr-2 inline-block",
                          project.status === "Approved" ? "bg-primary" : "bg-muted-foreground"
                        )} />
                        {project.status}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
