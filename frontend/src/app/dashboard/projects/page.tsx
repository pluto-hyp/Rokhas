"use client";

import { useEffect, useState } from "react";
import { ApiError, getProjects, Project, updateProjectStatus, PermitDocument } from "@/lib/api";
import { 
  FileText, 
  Search, 
  Plus, 
  Filter,
  CheckCircle2,
  Clock,
  Printer,
  ShieldCheck,
  Building,
  User,
  X,
  CreditCard,
  Download,
  AlertCircle,
  Sparkles,
  Bot,
  Eye
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { OfficialPermitCertificate } from "@/components/OfficialPermitCertificate";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "/api/v1").replace(/\/+$/, "");

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { token, isLoading, logout, user: authUser } = useAuth();
  const role = authUser?.role || "citizen";

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showPermitModal, setShowPermitModal] = useState(false);

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

  useEffect(() => {
    if (typeof window !== "undefined" && projects.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const id = params.get("project_id") || params.get("id");
      if (id) {
        router.push(`/dashboard/projects/${id}`);
      }
    }
  }, [projects, router]);

  const parseProjectMeta = (desc?: string) => {
    const text = desc || "";
    const refMatch = text.match(/\[REF:\s*([^\]]+)\]/);
    const citizenMatch = text.match(/\[CITIZEN:\s*([^\]]+)\]/);
    const cinMatch = text.match(/\[CIN:\s*([^\]]+)\]/);
    const feeMatch = text.match(/\[COMMUNE FEE PAID:\s*([^\]]+)\]/);
    const receiptMatch = text.match(/\[RECEIPT:\s*([^\]]+)\]/);

    const cleanDesc = text
      .replace(/\[REF:\s*[^\]]+\]/g, "")
      .replace(/\[CITIZEN:\s*[^\]]+\]/g, "")
      .replace(/\[CIN:\s*[^\]]+\]/g, "")
      .replace(/\[COMMUNE FEE PAID:\s*[^\]]+\]/g, "")
      .replace(/\[RECEIPT:\s*[^\]]+\]/g, "")
      .trim();

    return {
      landRef: refMatch ? refMatch[1] : "Conservation Foncière AB-948",
      citizenName: citizenMatch ? citizenMatch[1] : "Mohamed Alami",
      citizenCin: cinMatch ? cinMatch[1] : "AB123456",
      fee: feeMatch ? feeMatch[1] : "16,500 DH",
      receiptId: receiptMatch ? receiptMatch[1] : "REC-2026-MA-482012",
      description: cleanDesc || "New construction permit application filed by architect."
    };
  };

  const handleRowClick = (project: Project) => {
    router.push(`/dashboard/projects/${project.id}`);
  };

  const getStatusBadge = (status: string) => {
    if (status === "Approved") {
      return (
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20">
          <CheckCircle2 className="size-3" /> Approved
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20">
        <Clock className="size-3" /> Under Review
      </span>
    );
  };

  return (
    <div className="space-y-8 px-4 py-4 relative">
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Permit Dossiers</h1>
          <p className="text-muted-foreground mt-1 font-medium">
            {role === "authority" 
              ? "Municipal desk workspace: validate paid architect dossiers and extract official permit papers."
              : "Monitor planning clearances, view payment certifications, and download extracted permits."
            }
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search dossiers..." className="pl-10 rounded-xl border-border/40" />
          </div>
          {role === "architect" && (
            <Link href="/dashboard/projects/create">
              <Button className="rounded-xl bg-primary text-primary-foreground font-bold hover:scale-[1.02] active:scale-[0.98] transition-all gap-2 shadow-md shadow-primary/10">
                <Plus className="w-4 h-4" />
                Submit New Dossier
              </Button>
            </Link>
          )}
        </div>
      </div>

      <Card className="border-border/40 shadow-none bg-card overflow-hidden">
        <div className="p-4 border-b border-border/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="rounded-lg gap-2 text-xs border-border/40">
              <Filter className="w-3 h-3" />
              Filter List
            </Button>
          </div>
          <p className="text-xs text-muted-foreground font-bold">{projects.length} dossiers registered</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/40">
              <tr>
                <th className="px-6 py-4">Ref No.</th>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Dossier Classification</th>
                <th className="px-6 py-4">Date Filed</th>
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
                    <p className="font-semibold text-sm">No permit requests registered yet.</p>
                  </td>
                </tr>
              ) : (
                projects.map((project) => (
                  <tr 
                    key={project.id} 
                    onClick={() => handleRowClick(project)}
                    className="hover:bg-muted/30 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <p className="text-xs font-bold text-muted-foreground">RKH-2026-{project.id.toString().padStart(4, '0')}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-foreground">{project.title}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-bold text-primary">{project.type || "Building Permit"}</p>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-muted-foreground">
                      {new Date(project.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {getStatusBadge(project.status)}
                        {project.status === "Approved" && (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProject(project);
                              setShowPermitModal(true);
                            }}
                            className="size-8 rounded-lg hover:bg-emerald-500/10 text-emerald-500"
                            title="Download official permit"
                          >
                            <Download className="size-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* OFFICIAL CONSTRUCTION PERMIT CERTIFICATE MODAL */}
      {showPermitModal && selectedProject && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-background/90 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-8">
            <OfficialPermitCertificate 
              data={{
                dossier_id: selectedProject.id,
                applicant_name: (() => {
                  const meta = parseProjectMeta(selectedProject.description);
                  return meta.citizenName;
                })(),
                applicant_cin: (() => {
                  const meta = parseProjectMeta(selectedProject.description);
                  return meta.citizenCin;
                })(),
                project_title: selectedProject.title,
                project_description: selectedProject.description || "",
                location: selectedProject.zone || "Not specified",
                land_reference: (() => {
                  const meta = parseProjectMeta(selectedProject.description);
                  return meta.landRef;
                })(),
                dimensions: {
                  hauteur: selectedProject.hauteur,
                  recul: selectedProject.recul,
                  emprise: selectedProject.emprise,
                  surface_terrain: selectedProject.surface_terrain,
                },
                zone: selectedProject.zone || "Not specified",
                signed_by: selectedProject.signed_by || "Municipal Authority",
                signature_hash: selectedProject.signature_hash || "",
                signed_at: selectedProject.signed_at || new Date().toISOString(),
              }}
              onClose={() => setShowPermitModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
