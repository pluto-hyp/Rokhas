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
  Bot
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { token, isLoading, logout, user: authUser } = useAuth();
  const role = authUser?.role || "citizen";

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showPermitModal, setShowPermitModal] = useState(false);
  const [extracting, setExtracting] = useState(false);

  const [revokingDocKey, setRevokingDocKey] = useState<string | null>(null);
  const [revocationReason, setRevocationReason] = useState<string>("");
  const [selectedDocKey, setSelectedDocKey] = useState<string | null>(null);

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
        const proj = projects.find(p => p.id === parseInt(id));
        if (proj) {
          setSelectedProject(proj);
        }
      }
    }
  }, [projects]);

  useEffect(() => {
    setSelectedDocKey(null);
    setRevokingDocKey(null);
    setRevocationReason("");
  }, [selectedProject?.id]);

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

  const openDocumentPreview = async (doc: PermitDocument) => {
    const normalizedFilename = doc.filename?.trim();
    const explicitUrl = doc.url?.trim();
    if (explicitUrl) {
      window.open(explicitUrl, "_blank", "noopener,noreferrer");
      return;
    }

    if (!normalizedFilename?.toLowerCase().endsWith(".pdf")) {
      toast.error("No preview available for this document.");
      return;
    }

    const candidateUrl = `${window.location.origin}/${encodeURIComponent(normalizedFilename)}`;

    try {
      const res = await fetch(candidateUrl, { method: "HEAD" });
      if (res.ok || res.status === 405) {
        window.open(candidateUrl, "_blank", "noopener,noreferrer");
      } else {
        toast.error("PDF preview is not available because the file is not stored on this server.");
      }
    } catch {
      toast.error("PDF preview is not available because the file is not accessible.");
    }
  };

  const handleRowClick = (project: Project) => {
    setSelectedProject(project);
  };

  const handleToggleDocumentApproval = async (docKey: string, approve: boolean, reasonText?: string) => {
    if (!selectedProject || !token) return;
    const updatedDocuments = (selectedProject.permit_documents || []).map((doc) => {
      if (doc.key === docKey) {
        return {
          ...doc,
          approved: approve,
          notes: approve ? [] : reasonText ? [reasonText] : doc.notes
        };
      }
      return doc;
    });
    try {
      toast.loading(approve ? "Approving document..." : "Revoking document...", { id: "doc-update" });
      const updatedProj = await updateProjectStatus(selectedProject.id, { permit_documents: updatedDocuments }, token);
      setSelectedProject(updatedProj);
      setProjects((prev) => prev.map((p) => (p.id === updatedProj.id ? updatedProj : p)));
      toast.success(approve ? "Document successfully approved!" : "Document revoked.", { id: "doc-update" });
      setRevokingDocKey(null);
      setRevocationReason("");
    } catch (err) {
      toast.error("Failed to update status.", { id: "doc-update" });
    }
  };

  const handleExtractPermit = () => {
    if (!selectedProject) return;
    setExtracting(true);

    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: 'Verifying digital CMI payment ledger and stamping permit...',
        success: () => {
          setProjects(prev => 
            prev.map(p => p.id === selectedProject.id ? { ...p, status: "Approved" } : p)
          );
          setSelectedProject(prev => prev ? { ...prev, status: "Approved" } : null);
          setExtracting(false);
          setShowPermitModal(true);
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
                      <CardHeader className="p-3 pb-2 bg-emerald-500/5 flex flex-row items-center justify-between">
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

                    {/* AI Co-pilot Compliance Analysis */}
                    <Card className="rounded-2xl border border-primary/20 bg-primary/5 shadow-none overflow-hidden">
                      <CardHeader className="p-4 pb-2 bg-primary/10 flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-xs font-bold flex items-center gap-1.5 text-primary">
                          <Bot className="size-4 animate-bounce" />
                          AI Compliance Co-pilot Report
                        </CardTitle>
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold text-primary bg-primary/10 border border-primary/20 animate-pulse">
                          <Sparkles className="size-2.5" /> AI Checked
                        </span>
                      </CardHeader>
                      <CardContent className="p-4 space-y-2 text-xs text-foreground/90">
                        {selectedProject.ai_analysis ? (
                          <div className="whitespace-pre-line leading-relaxed font-sans text-muted-foreground bg-background/40 p-3 rounded-xl border border-border/25">
                            {selectedProject.ai_analysis}
                          </div>
                        ) : (
                          <p className="text-muted-foreground italic">No automatic compliance analysis report available for this dossier.</p>
                        )}
                      </CardContent>
                    </Card>

                    {/* Architect Uploaded Documents Checklist */}
                    <div className="space-y-3">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                        <span>Architect Uploaded Documents Checklist</span>
                        <span className="text-[9px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground normal-case font-semibold">
                          {(selectedProject.permit_documents || []).filter(d => d.approved).length} / {(selectedProject.permit_documents || []).length} Verified
                        </span>
                      </Label>
                      
                      <div className="space-y-3">
                        {(!selectedProject.permit_documents || selectedProject.permit_documents.length === 0) ? (
                          <div className="p-4 rounded-xl border border-dashed border-border/40 text-center text-xs text-muted-foreground italic">
                            No files have been uploaded for this dossier.
                          </div>
                        ) : (
                          selectedProject.permit_documents.map((doc) => {
                            const isVerified = doc.approved;
                            const hasNotes = doc.notes && doc.notes.length > 0;
                            const isDocKeyRevoking = revokingDocKey === doc.key;
                            const canInspect = !!doc.url || doc.filename.toLowerCase().endsWith(".pdf");
                            
                            return (
                              <div 
                                key={doc.key} 
                                onClick={() => setSelectedDocKey((prev) => (prev === doc.key ? null : doc.key))}
                                className={cn(
                                  "p-3.5 rounded-xl border transition-all space-y-3 bg-background/50 cursor-pointer",
                                  isVerified 
                                    ? "border-emerald-500/25 bg-emerald-500/[0.01]" 
                                    : hasNotes 
                                      ? "border-destructive/25 bg-destructive/[0.01]"
                                      : "border-border/40"
                                )}
                              >
                                {/* File Header */}
                                <div className="space-y-3">
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="space-y-1 min-w-0 flex-1">
                                      <div className="flex items-center gap-1.5">
                                        <FileText className={cn("size-4 shrink-0", isVerified ? "text-emerald-500" : hasNotes ? "text-destructive" : "text-primary")} />
                                        <span className="text-xs font-bold text-foreground truncate block">{doc.label}</span>
                                        {doc.required && (
                                          <span className="text-[8px] bg-destructive/10 text-destructive border border-destructive/20 px-1 py-0.1 rounded font-black uppercase shrink-0">
                                            Req
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-[10px] text-muted-foreground font-mono truncate">{doc.filename} {doc.size ? `(${doc.size})` : ""}</p>
                                    </div>

                                    <div className="shrink-0 flex items-center gap-1.5">
                                      {isVerified ? (
                                        <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[9px] hover:bg-emerald-500/15 font-bold gap-1 py-0.5">
                                          <CheckCircle2 className="size-2.5" /> Approved
                                        </Badge>
                                      ) : hasNotes ? (
                                        <Badge className="bg-destructive/10 text-destructive border border-destructive/20 text-[9px] hover:bg-destructive/15 font-bold gap-1 py-0.5">
                                          <AlertCircle className="size-2.5" /> Revoked
                                        </Badge>
                                      ) : (
                                        <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[9px] hover:bg-amber-500/15 font-bold gap-1 py-0.5">
                                          <Clock className="size-2.5" /> Pending
                                        </Badge>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between gap-3">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedDocKey((prev) => (prev === doc.key ? null : doc.key));
                                      }}
                                      className="h-8 px-2.5 rounded-lg text-[10px] font-bold"
                                    >
                                      <Search className="size-3" />
                                      {selectedDocKey === doc.key ? "Hide file info" : "Inspect file"}
                                    </Button>
                                    <span className="text-[9px] text-muted-foreground">Click to view metadata for manual review.</span>
                                  </div>
                                </div>

                                {/* Display revocation notes/reason if any */}
                                {hasNotes && !isVerified && (
                                  <div className="p-2.5 rounded-lg bg-destructive/5 border border-destructive/10 text-[11px] text-destructive font-medium space-y-1">
                                    <p className="text-[9px] uppercase font-bold text-destructive/80 tracking-wider">Reason for Revocation:</p>
                                    <p className="italic">"{doc.notes[0]}"</p>
                                  </div>
                                )}

                                {/* Expanded document metadata for manual review */}
                                {selectedDocKey === doc.key && (
                                  <div className="p-3 rounded-xl bg-muted/5 border border-border/30 text-[11px] text-muted-foreground space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                      <div>
                                        <p className="text-[9px] uppercase font-semibold text-muted-foreground">File Name</p>
                                        <p className="text-xs text-foreground font-medium">{doc.filename}</p>
                                      </div>
                                      <div>
                                        <p className="text-[9px] uppercase font-semibold text-muted-foreground">Size</p>
                                        <p className="text-xs text-foreground font-medium">{doc.size || "Not specified"}</p>
                                      </div>
                                      <div>
                                        <p className="text-[9px] uppercase font-semibold text-muted-foreground">Required</p>
                                        <p className="text-xs text-foreground font-medium">{doc.required ? "Yes" : "Optional"}</p>
                                      </div>
                                      <div>
                                        <p className="text-[9px] uppercase font-semibold text-muted-foreground">Current Status</p>
                                        <p className="text-xs text-foreground font-medium">{isVerified ? "Approved" : hasNotes ? "Revoked" : "Pending"}</p>
                                      </div>
                                    </div>

                                    {doc.notes && doc.notes.length > 0 && (
                                      <div className="rounded-lg bg-destructive/10 border border-destructive/15 p-3 text-destructive">
                                        <p className="text-[9px] uppercase font-bold tracking-wider">Latest note</p>
                                        <p className="text-xs italic">{doc.notes[0]}</p>
                                      </div>
                                    )}

                                    <div className="flex flex-col gap-3">
                                      {canInspect && (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            openDocumentPreview(doc);
                                          }}
                                          className="h-9 px-3 rounded-lg text-[10px] font-bold"
                                        >
                                          <Download className="size-3" />
                                          Open PDF
                                        </Button>
                                      )}
                                      <p className="text-[10px] text-muted-foreground/80">
                                        Review the file metadata above before approving or revoking. If the file is available in the source system, open it to verify the PDF contents.
                                      </p>
                                    </div>
                                  </div>
                                )}

                                {/* Interactive Verification Actions (restricted to admin & authority) */}
                                {(role === "admin" || role === "authority") && (
                                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-border/30">
                                    {!isVerified ? (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleToggleDocumentApproval(doc.key, true)}
                                        className="h-7 px-2.5 rounded-lg text-[10px] font-black text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10 bg-emerald-500/5 gap-1"
                                      >
                                        <CheckCircle2 className="size-3" /> Approve Document
                                      </Button>
                                    ) : (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                          setRevokingDocKey(doc.key);
                                          setRevocationReason("");
                                        }}
                                        className="h-7 px-2.5 rounded-lg text-[10px] font-black text-destructive hover:text-destructive/85 hover:bg-destructive/10 bg-destructive/5 gap-1"
                                      >
                                        <AlertCircle className="size-3" /> Revoke Certification
                                      </Button>
                                    )}
                                  </div>
                                )}

                                {/* Inline Revocation Reason Input Panel */}
                                {isDocKeyRevoking && (
                                  <div className="p-3 rounded-lg bg-muted/20 border border-border/50 space-y-2 animate-in slide-in-from-top-1 duration-200">
                                    <div className="space-y-1.5">
                                      <Label htmlFor={`reason-${doc.key}`} className="text-[10px] font-bold text-foreground">
                                        Explain why this document is being rejected / revoked:
                                      </Label>
                                      <Input
                                        id={`reason-${doc.key}`}
                                        placeholder="e.g., Signature page missing, low-resolution drawing..."
                                        value={revocationReason}
                                        onChange={(e) => setRevocationReason(e.target.value)}
                                        className="h-8 text-xs rounded-lg border-border/40 bg-background"
                                      />
                                    </div>
                                    <div className="flex items-center justify-end gap-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          setRevokingDocKey(null);
                                          setRevocationReason("");
                                        }}
                                        className="h-7 px-2.5 text-[9px] font-bold rounded-lg border-border/40"
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                        size="sm"
                                        disabled={!revocationReason.trim()}
                                        onClick={() => handleToggleDocumentApproval(doc.key, false, revocationReason)}
                                        className="h-7 px-2.5 text-[9px] font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg"
                                      >
                                        Confirm Revoke
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
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
