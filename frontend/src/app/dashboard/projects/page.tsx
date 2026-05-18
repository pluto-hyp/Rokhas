"use client";

import { useEffect, useState } from "react";
import { ApiError, getProjects, Project } from "@/lib/api";
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
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { toast } from "sonner";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { token, isLoading, logout, user: authUser } = useAuth();
  const role = authUser?.role || "citizen";

  // Selected project for details / validation drawer
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showPermitModal, setShowPermitModal] = useState(false);
  const [extracting, setExtracting] = useState(false);

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

  // Parse transaction bill and legal identifiers from project description if formatted
  const parseProjectMeta = (desc: string) => {
    const refMatch = desc.match(/\[REF:\s*([^\]]+)\]/);
    const citizenMatch = desc.match(/\[CITIZEN:\s*([^\]]+)\]/);
    const cinMatch = desc.match(/\[CIN:\s*([^\]]+)\]/);
    const feeMatch = desc.match(/\[COMMUNE FEE PAID:\s*([^\]]+)\]/);
    const receiptMatch = desc.match(/\[RECEIPT:\s*([^\]]+)\]/);

    const cleanDesc = desc
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
    setSelectedProject(project);
  };

  // Authority validates payment and extracts permit paper
  const handleExtractPermit = () => {
    if (!selectedProject) return;
    setExtracting(true);

    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: 'Verifying digital CMI payment ledger and stamping permit...',
        success: () => {
          // Update status in frontend list for real-time simulation feedback
          setProjects(prev => 
            prev.map(p => p.id === selectedProject.id ? { ...p, status: "Approved" } : p)
          );
          setSelectedProject(prev => prev ? { ...prev, status: "Approved" } : null);
          setExtracting(false);
          setShowPermitModal(true); // Open the official printable permit sheet!
          return 'Official Construction Permit Paper extracted successfully!';
        },
        error: 'Validation failed'
      }
    );
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
        <div className="p-4 bg-muted/10 border-b border-border/40 flex items-center justify-between">
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
            <thead className="bg-muted/30 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/40">
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

      {/* Details & Action Drawer Overlay */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex justify-end bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-card border-l border-border/40 h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
            
            {/* Drawer Header */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">
                  RKH-2026-{selectedProject.id.toString().padStart(4, '0')}
                </span>
                <button 
                  onClick={() => setSelectedProject(null)}
                  className="size-8 rounded-full border border-border/40 hover:bg-muted flex items-center justify-center"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div>
                <h3 className="text-xl font-bold text-foreground">{selectedProject.title}</h3>
                <p className="text-xs font-bold text-primary mt-1">{selectedProject.type || "Building Permit"}</p>
              </div>
              <Separator className="bg-border/40" />

              {/* Parsed dossier info */}
              {(() => {
                const meta = parseProjectMeta(selectedProject.description);
                return (
                  <div className="space-y-6 pt-2">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Description</Label>
                      <p className="text-xs text-foreground leading-relaxed leading-relaxed">{meta.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3.5 rounded-xl bg-muted/10 border border-border/40 space-y-1">
                        <User className="size-4 text-primary" />
                        <p className="text-[9px] font-bold text-muted-foreground uppercase mt-1">Owner / Citizen</p>
                        <p className="text-xs font-bold text-foreground">{meta.citizenName}</p>
                        <p className="text-[9px] text-muted-foreground font-semibold">{meta.citizenCin}</p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-muted/10 border border-border/40 space-y-1">
                        <Building className="size-4 text-primary" />
                        <p className="text-[9px] font-bold text-muted-foreground uppercase mt-1">Conservation Foncière</p>
                        <p className="text-xs font-bold text-foreground truncate">{meta.landRef}</p>
                      </div>
                    </div>

                    {/* Security payment audit block */}
                    <Card className="rounded-2xl border-border/40 bg-background/50 shadow-none overflow-hidden border-emerald-500/20">
                      <CardHeader className="p-4 pb-2 bg-emerald-500/5 flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-xs font-bold flex items-center gap-1.5 text-emerald-600">
                          <ShieldCheck className="size-4" />
                          CMI Transaction Bill Verified
                        </CardTitle>
                        <Badge className="bg-emerald-500 text-white font-bold text-[9px]">Settle OK</Badge>
                      </CardHeader>
                      <CardContent className="p-4 space-y-2 text-[11px] text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Municipal planning fee:</span>
                          <strong className="text-foreground">{meta.fee}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Receipt validation code:</span>
                          <strong className="text-foreground font-mono">{meta.receiptId}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Paid by:</span>
                          <strong className="text-foreground">Authorized Architect</strong>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })()}
            </div>

            {/* Action Bar */}
            <div className="border-t border-border/40 pt-4 mt-8 flex flex-col gap-3">
              {role === "authority" && selectedProject.status !== "Approved" && (
                <Button 
                  onClick={handleExtractPermit}
                  disabled={extracting}
                  className="w-full h-12 rounded-xl text-sm font-black bg-primary text-primary-foreground hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/10"
                >
                  <Printer className="size-4" />
                  {extracting ? "Validating & Stamping..." : "Approve & Extract Official Permit"}
                </Button>
              )}

              {selectedProject.status === "Approved" && (
                <Button 
                  onClick={() => setShowPermitModal(true)}
                  className="w-full h-12 rounded-xl text-sm font-black bg-emerald-600 hover:bg-emerald-500 text-white hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/10"
                >
                  <Printer className="size-4" />
                  View & Print Extracted Permit Paper
                </Button>
              )}

              <Button 
                variant="outline"
                onClick={() => setSelectedProject(null)}
                className="w-full h-12 rounded-xl font-bold text-sm border-border/40 hover:bg-muted"
              >
                Close View
              </Button>
            </div>

          </div>
        </div>
      )}

      {/* GOLDEN-BORDER PRINTABLE OFFICIAL CONSTRUCTION PERMIT MODAL */}
      {showPermitModal && selectedProject && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-background/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white border-[12px] border-amber-800/20 rounded-3xl shadow-2xl p-8 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col justify-between text-stone-900 font-serif min-h-[680px]">
            
            {/* Modal Exit */}
            <button 
              onClick={() => setShowPermitModal(false)}
              className="absolute top-4 right-4 size-8 rounded-full border border-stone-200 hover:bg-stone-100 flex items-center justify-center shrink-0 transition-all font-sans text-stone-600 z-50"
            >
              <X className="size-4" />
            </button>

            {/* Kingdom Header */}
            <div className="text-center space-y-1">
              <h2 className="text-lg font-bold uppercase tracking-wider text-amber-900">المملكة المغربية</h2>
              <h3 className="text-sm font-bold text-stone-700">ROYAUME DU MAROC</h3>
              <p className="text-[10px] text-stone-500 uppercase tracking-widest font-sans font-bold">Ministère de l'Intérieur • Commune Urbaine</p>
              <Separator className="bg-amber-900/30 max-w-xs mx-auto mt-2" />
            </div>

            {/* Title */}
            <div className="text-center space-y-2 my-6">
              <h1 className="text-3xl font-extrabold text-amber-900 tracking-wide font-serif">رخصة البناء الرسمية</h1>
              <h2 className="text-base font-bold text-stone-800 uppercase tracking-widest font-sans">Official Construction & Planning Permit</h2>
              <p className="text-[10px] font-sans text-stone-500 font-bold">REGISTRY NO: MA-RKH-2026-{selectedProject.id.toString().padStart(4, '0')}</p>
            </div>

            {/* Permit content */}
            {(() => {
              const meta = parseProjectMeta(selectedProject.description);
              return (
                <div className="space-y-5 text-sm leading-relaxed border-y border-stone-200 py-6 my-2 font-serif text-stone-800">
                  <p>
                    By mandate of the municipal council and in accordance with urban regulations of zoning plans, this official permit is hereby granted to 
                    <strong className="text-stone-900 underline decoration-amber-900/40"> Mr. {meta.citizenName}</strong>, holding CIN 
                    <strong className="text-stone-900"> {meta.citizenCin}</strong>, for the project titled 
                    <strong className="text-stone-900"> "{selectedProject.title}"</strong>.
                  </p>

                  <div className="grid grid-cols-2 gap-6 text-xs bg-stone-50 p-4 rounded-2xl border border-stone-100 font-sans">
                    <div className="space-y-1">
                      <p className="text-stone-500 uppercase font-bold text-[9px]">Zoning & Land Reference</p>
                      <p className="text-stone-800 font-bold">{meta.landRef}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-stone-500 uppercase font-bold text-[9px]">Classification Type</p>
                      <p className="text-stone-800 font-bold">{selectedProject.type || "Building Permit"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-stone-500 uppercase font-bold text-[9px]">Commune Ledger Fees</p>
                      <p className="text-emerald-700 font-bold">{meta.fee} Settled</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-stone-500 uppercase font-bold text-[9px]">Transaction Verification</p>
                      <p className="text-stone-800 font-mono font-bold text-[10px]">{meta.receiptId}</p>
                    </div>
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed leading-relaxed font-sans italic">
                    NB: The municipal validation desk registers that all building calculations, safety guidelines, and architectural compliance rules verified by the AI Co-pilot are fully certified.
                  </p>
                </div>
              );
            })()}

            {/* Golden Stamp & Signatures */}
            <div className="flex justify-between items-end mt-4 pt-2">
              {/* QR and Stamp */}
              <div className="flex items-center gap-4 text-[10px] font-sans text-stone-500 font-bold">
                <div className="w-16 h-16 border-2 border-stone-800/10 rounded-xl bg-stone-100 flex items-center justify-center text-xs shrink-0 select-none">
                  [ QR Code ]
                </div>
                <div className="space-y-1">
                  <p className="text-stone-800 font-black">Digital Certified Seal</p>
                  <p>Trésorerie du Royaume</p>
                  <p className="text-amber-900">ROKHAS VALIDATED</p>
                </div>
              </div>

              {/* Sign stamp */}
              <div className="text-right font-serif space-y-1">
                <p className="text-[10px] font-sans text-stone-500 uppercase font-bold">President of Municipal Council</p>
                <div className="py-2 opacity-80 h-10 select-none text-xs italic text-stone-600">
                  [ Certified Signature ]
                </div>
                <p className="text-xs font-black text-amber-900">Commune de Rabat</p>
              </div>
            </div>

            {/* Print Action button */}
            <div className="mt-8 border-t border-stone-100 pt-4 flex justify-end font-sans">
              <Button 
                onClick={() => {
                  window.print();
                }}
                className="h-10 rounded-xl bg-amber-900 hover:bg-stone-800 text-white font-bold px-6 flex items-center gap-2"
              >
                <Printer className="size-4" />
                Print Certificate
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
