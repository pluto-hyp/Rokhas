"use client";

import { useEffect, useState } from "react";
import { getProjects, Project } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProjects() {
      try {
        const data = await getProjects();
        setProjects(data);
      } catch (error) {
        console.error("Failed to load projects", error);
      } finally {
        setLoading(false);
      }
    }
    loadProjects();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "Rejected": return "bg-destructive/10 text-destructive border-destructive/20";
      case "Under Review": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-serif font-bold tracking-tight">Projects</h2>
        <p className="text-muted-foreground mt-2">Manage your architectural permits and track their municipal status.</p>
      </div>

      <div className="rounded-md border border-border/40 bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Project Title</TableHead>
              <TableHead>Applicant</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Loading projects...
                </TableCell>
              </TableRow>
            ) : projects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No projects found.
                </TableCell>
              </TableRow>
            ) : (
              projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.id}</TableCell>
                  <TableCell className="font-semibold">{project.title}</TableCell>
                  <TableCell>{project.applicant}</TableCell>
                  <TableCell>{project.dateSubmitted}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline" className={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
