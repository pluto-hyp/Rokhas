"use client"

import * as React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Project } from "@/lib/api"
import { CircleCheckIcon, Loader2Icon, ClockIcon, AlertCircleIcon, FileTextIcon } from "lucide-react"

interface ProjectTableProps {
  data: Project[];
}

export function ProjectTable({ data }: ProjectTableProps) {
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return <CircleCheckIcon className="size-3 text-emerald-500" />;
      case "pending":
        return <ClockIcon className="size-3 text-amber-500" />;
      case "evaluating":
        return <Loader2Icon className="size-3 text-blue-500 animate-spin" />;
      case "rejected":
        return <AlertCircleIcon className="size-3 text-destructive" />;
      default:
        return <FileTextIcon className="size-3 text-muted-foreground" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "outline" as const;
      case "rejected":
        return "destructive" as const;
      default:
        return "secondary" as const;
    }
  };

  return (
    <div className="rounded-xl border border-border/40 overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="w-[100px]">Réf.</TableHead>
            <TableHead>Titre du Projet</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                Aucun dossier trouvé.
              </TableCell>
            </TableRow>
          ) : (
            data.map((project) => (
              <TableRow key={project.id} className="hover:bg-muted/30 transition-colors">
                <TableCell className="font-mono text-xs text-muted-foreground">
                  RKH-{2026}-{String(project.id).padStart(4, '0')}
                </TableCell>
                <TableCell className="font-medium">{project.title}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-tight">
                    {project.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(project.status)} className="gap-1 px-2 py-0.5">
                    {getStatusIcon(project.status)}
                    <span className="capitalize">{project.status}</span>
                  </Badge>
                </TableCell>
                <TableCell className="text-right text-xs text-muted-foreground">
                  {new Date(project.created_at || Date.now()).toLocaleDateString("fr-FR")}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
