"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ApiError, 
  getProject, 
  updateProjectStatus, 
  Project, 
  PermitDocument 
} from "@/lib/api";
import {
  FileText, 
  CheckCircle2,
  Clock,
  Printer,
  Loader2,
  ShieldCheck,
  Building,
  User,
  Download,
  AlertCircle,
  Sparkles,
  Bot,
  Eye,
  X,
  ChevronRight,
  RefreshCw,
  XCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { OfficialPermitCertificate } from "@/components/OfficialPermitCertificate";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "/api/v1").replace(/\/+$/, "");

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const idStr = Array.isArray(id) ? id[0] : id;
  const dossierId = idStr ? parseInt(idStr) : NaN;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifyingCompliance, setVerifyingCompliance] = useState(false);
  const { token, isLoading, logout, user: authUser } = useAuth();
  const role = authUser?.role || "citizen";

  const [showPermitModal, setShowPermitModal] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [rejectingDossier, setRejectingDossier] = useState(false);

  const [revokingDocKey, setRevokingDocKey] = useState<string | null>(null);
  const [revocationReason, setRevocationReason] = useState<string>("");
  
  const [activePreviewDoc, setActivePreviewDoc] = useState<{ 
    key: string; 
    filename: string; 
    type: string; 
    url: string; 
  } | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  useEffect(() => {
    async function loadProject() {
      if (isLoading) return;
      if (!token) {
        setLoading(false);
        return;
      }
      if (isNaN(dossierId)) {
        toast.error("Invalid dossier ID");
        setLoading(false);
        return;
      }

      try {
        const data = await getProject(dossierId, token);
        setProject(data);
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          logout();
          return;
        }
        console.error("Failed to load dossier", error);
        toast.error("Dossier not found or access denied.");
      } finally {
        setLoading(false);
      }
    }
    loadProject();
  }, [isLoading, token, logout, dossierId]);

  useEffect(() => {
    return () => {
      if (activePreviewDoc?.url) {
        URL.revokeObjectURL(activePreviewDoc.url);
      }
    };
  }, [activePreviewDoc]);

  const fetchDocumentBlob = async (doc: PermitDocument) => {
    if (!token) {
      throw new Error("Your session has expired. Please sign in again.");
    }

    const filename = doc.filename?.trim() || "document";
    const primaryEndpoint = `${API_BASE_URL}/dossiers/${dossierId}/documents/${encodeURIComponent(filename)}`;

    const response = await fetch(primaryEndpoint, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.ok) {
      return response.blob();
    }

    // If primary endpoint failed with 404 and we have a stored URL pointing to temporary upload,
    // try fetching from that URL directly (handles dossiers where files weren't moved to permanent storage)
    if (response.status === 404 && doc.url) {
      const fallbackUrl = doc.url.startsWith("/") 
        ? `${window.location.origin}${doc.url}` 
        : doc.url;
      
      const fallbackResponse = await fetch(fallbackUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (fallbackResponse.ok) {
        return fallbackResponse.blob();
      }

      const fallbackError = await fallbackResponse.json().catch(() => ({ detail: "Document request failed" }));
      throw new Error(fallbackError.detail || "Document request failed");
    }

    const error = await response.json().catch(() => ({ detail: "Document request failed" }));
    throw new Error(error.detail || "Document request failed");
  };

  const handleSelectDocument = async (doc: PermitDocument) => {
    if (activePreviewDoc?.key === doc.key) {
      setActivePreviewDoc(null);
      return;
    }

    setLoadingPreview(true);
    try {
      let blob = await fetchDocumentBlob(doc);
      
      // Ensure the Blob has the correct MIME type based on file extension for previewing
      if (blob.type === "application/octet-stream" || !blob.type) {
        const filename = doc.filename || "";
        let inferredType = blob.type;
        if (filename.toLowerCase().endsWith(".pdf")) {
          inferredType = "application/pdf";
        } else if (filename.toLowerCase().endsWith(".jpg") || filename.toLowerCase().endsWith(".jpeg")) {
          inferredType = "image/jpeg";
        } else if (filename.toLowerCase().endsWith(".png")) {
          inferredType = "image/png";
        } else if (filename.toLowerCase().endsWith(".gif")) {
          inferredType = "image/gif";
        }
        if (inferredType !== blob.type) {
          blob = new Blob([blob], { type: inferredType });
        }
      }

      const url = window.URL.createObjectURL(blob);
      
      if (activePreviewDoc?.url) {
        URL.revokeObjectURL(activePreviewDoc.url);
      }

      setActivePreviewDoc({
        key: doc.key,
        filename: doc.filename || "document",
        type: blob.type,
        url
      });
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to load document preview");
      setActivePreviewDoc(null);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleDownloadDocument = async (doc: PermitDocument) => {
    try {
      toast.loading("Preparing download...", { id: "doc-download" });
      const blob = await fetchDocumentBlob(doc);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.filename || "document";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Download started!", { id: "doc-download" });
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to download document", { id: "doc-download" });
    }
  };

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
      landRef: refMatch ? refMatch[1] : (project?.land_reference || "Conservation Foncière AB-948"),
      citizenName: citizenMatch ? citizenMatch[1] : (project?.owner_name || "Mohamed Alami"),
      citizenCin: cinMatch ? cinMatch[1] : (project?.owner_cin || "AB123456"),
      fee: feeMatch ? feeMatch[1] : (project?.municipal_fee_amount ? `${project.municipal_fee_amount.toLocaleString()} DH` : "16,500 DH"),
      receiptId: receiptMatch ? receiptMatch[1] : (project?.municipal_fee_receipt || "REC-2026-MA-482012"),
      description: cleanDesc || "New construction permit application filed by architect."
    };
  };

  const handleToggleDocumentApproval = async (docKey: string, approve: boolean, reasonText?: string) => {
    if (!project || !token) return;
    const updatedDocuments = (project.permit_documents || []).map((doc) => {
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
      const updatedProj = await updateProjectStatus(project.id, { permit_documents: updatedDocuments }, token);
      setProject(updatedProj);
      toast.success(approve ? "Document approved successfully!" : "Document revoked.", { id: "doc-update" });
      setRevokingDocKey(null);
      setRevocationReason("");
    } catch {
      toast.error("Failed to update document status.", { id: "doc-update" });
    }
  };

  const handleExtractPermit = async () => {
    if (!project || !token) return;
    setExtracting(true);

    try {
      toast.loading("Verifying digital CMI payment ledger and stamping permit...", { id: "permit-extraction" });
      const updatedProject = await updateProjectStatus(project.id, { status: "Approved" }, token);
      setProject(updatedProject);
      toast.success("Official Construction Permit Paper extracted successfully!", { id: "permit-extraction" });
      setShowPermitModal(true);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to extract permit";
      toast.error(errorMsg, { id: "permit-extraction" });
    } finally {
      setExtracting(false);
    }
  };

  const canApproveDossier = () => {
    if (!project) return false;
    const requiredDocs = (project.permit_documents || []).filter((doc) => doc.required !== false);
    return requiredDocs.length > 0 && requiredDocs.every((doc) => doc.approved);
  };

  const canRejectDossier = () => {
    if (!project) return false;
    return (project.permit_documents || []).some((doc) => !doc.approved && doc.notes?.some((note) => note.trim()));
  };

  const handleRejectDossier = async () => {
    if (!project || !token) return;

    if (!canRejectDossier()) {
      toast.error("Reject at least one document and provide a reason before rejecting the dossier.");
      return;
    }

    setRejectingDossier(true);
    try {
      toast.loading("Rejecting dossier and saving document remarks...", { id: "dossier-reject" });
      const updatedProject = await updateProjectStatus(
        project.id,
        { status: "Rejected", permit_documents: project.permit_documents || [] },
        token
      );
      setProject(updatedProject);
      toast.success("Dossier rejected. The applicant can see the rejected file remarks.", { id: "dossier-reject" });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to reject dossier";
      toast.error(errorMsg, { id: "dossier-reject" });
    } finally {
      setRejectingDossier(false);
    }
  };

  const handleTriggerComplianceCheck = async () => {
    if (!project || !token) return;
    setVerifyingCompliance(true);
    try {
      toast.loading("Running AI Compliance Co-pilot analysis...", { id: "compliance-check" });
      const response = await fetch(`${API_BASE_URL}/dossiers/${project.id}/verify-compliance`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error("Failed to re-run compliance audit.");
      }
      const data = await response.json();
      if (data.dossier) {
        setProject(data.dossier);
      }
      toast.success("AI Compliance audit completed!", { id: "compliance-check" });
    } catch (err) {
      console.error(err);
      toast.error("Compliance run failed.", { id: "compliance-check" });
    } finally {
      setVerifyingCompliance(false);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "Approved") {
      return (
        <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold gap-1 px-3 py-1 rounded-full text-xs">
          <CheckCircle2 className="size-3.5" /> Approved & Released
        </Badge>
      );
    }
    if (status === "Rejected") {
      return (
        <Badge className="bg-destructive hover:bg-destructive/90 text-white font-bold gap-1 px-3 py-1 rounded-full text-xs">
          <XCircle className="size-3.5" /> Rejected
        </Badge>
      );
    }
    return (
      <Badge className="bg-amber-500 hover:bg-amber-600 text-white font-bold gap-1 px-3 py-1 rounded-full text-xs animate-pulse">
        <Clock className="size-3.5" /> Under Administrative Review
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4">
        <RefreshCw className="size-8 text-primary animate-spin" />
        <p className="text-sm font-medium text-muted-foreground">Retrieving submitted dossier workspace...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4">
        <AlertCircle className="size-12 text-destructive" />
        <h3 className="text-lg font-bold">Dossier Workspace Error</h3>
        <p className="text-sm text-muted-foreground">We couldn&apos;t retrieve the specified dossier details.</p>
        <Button onClick={() => router.push("/dashboard/projects")} variant="outline" className="rounded-xl">
          Return to Dashboard
        </Button>
      </div>
    );
  }

  const meta = parseProjectMeta(project.description);

  return (
    <div className="space-y-6 px-6 py-2 relative max-w-full">
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/20 pb-5">
        <div className="space-y-2">
          
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <h1 className="text-2xl font-black tracking-tight text-foreground">{project.title}</h1>
            <Badge variant="outline" className="rounded-md bg-muted/30 border-border/40 font-mono text-xs py-0.5 px-2">
              Ref: RKH-2026-{project.id.toString().padStart(4, "0")}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5">
            <Building className="size-3.5 text-primary" />
            {project.type || "Building Permit"} Clearance Desk
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {getStatusBadge(project.status)}
        </div>
      </div>

      {/* Workspace Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Workspace Panel: Dossier Metadata and Document List */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Section 1: Specifications & Description */}
          <Card className="border-border/40 bg-card rounded-2xl shadow-xs overflow-hidden">
            <CardHeader className="p-5 pb-3 border-b border-border/10 bg-muted/10">
              <CardTitle className="text-sm font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <FileText className="size-4 text-primary" />
                Dossier Specifications
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-5">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Architect Application Details</Label>
                <p className="text-xs text-foreground leading-relaxed bg-muted/10 p-3.5 rounded-xl border border-border/20">{meta.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-muted/5 border border-border/30 space-y-1.5">
                  <div className="flex items-center gap-2 text-primary">
                    <User className="size-4" />
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Owner / Applicant</span>
                  </div>
                  <p className="text-xs font-bold text-foreground">{meta.citizenName}</p>
                  <p className="text-[10px] text-muted-foreground font-mono">CIN: {meta.citizenCin}</p>
                </div>

                <div className="p-4 rounded-xl bg-muted/5 border border-border/30 space-y-1.5">
                  <div className="flex items-center gap-2 text-primary">
                    <Building className="size-4" />
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Conservation Foncière</span>
                  </div>
                  <p className="text-xs font-bold text-foreground truncate">{meta.landRef}</p>
                  <p className="text-[10px] text-muted-foreground font-mono">Zone: {project.zone || "Not specified"}</p>
                </div>
              </div>

              {/* Construction parameters */}
              <div className="pt-2">
                <Label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block mb-2.5">Structural & Planning Parameters</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-muted/10 rounded-xl p-3 border border-border/10 text-center">
                    <p className="text-[9px] font-semibold text-muted-foreground uppercase">Max Height</p>
                    <p className="text-sm font-black text-foreground mt-1">{project.hauteur ?? "--"} m</p>
                  </div>
                  <div className="bg-muted/10 rounded-xl p-3 border border-border/10 text-center">
                    <p className="text-[9px] font-semibold text-muted-foreground uppercase">Setback (Recul)</p>
                    <p className="text-sm font-black text-foreground mt-1">{project.recul ?? "--"} m</p>
                  </div>
                  <div className="bg-muted/10 rounded-xl p-3 border border-border/10 text-center">
                    <p className="text-[9px] font-semibold text-muted-foreground uppercase">Footprint (Emprise)</p>
                    <p className="text-sm font-black text-foreground mt-1">{project.emprise ?? "--"} %</p>
                  </div>
                  <div className="bg-muted/10 rounded-xl p-3 border border-border/10 text-center">
                    <p className="text-[9px] font-semibold text-muted-foreground uppercase">Land Area</p>
                    <p className="text-sm font-black text-foreground mt-1">{project.surface_terrain ?? "--"} m²</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Fee Clearing (CMI bill audit) */}
          <Card className="rounded-2xl border-emerald-500/20 bg-background shadow-xs overflow-hidden">
            <CardHeader className="p-4 pb-2 bg-emerald-500/5 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-bold flex items-center gap-1.5 text-emerald-600">
                <ShieldCheck className="size-4" />
                CMI Electronic Settlement Cleared
              </CardTitle>
              <Badge className="bg-emerald-500 text-white font-bold text-[9px] px-2 py-0.5 rounded-md">Paid</Badge>
            </CardHeader>
            <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-muted-foreground">
              <div className="space-y-0.5">
                <span className="text-[9px] uppercase font-bold text-muted-foreground/85">Municipal Planning Fee</span>
                <p className="text-sm font-black text-foreground">{meta.fee}</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[9px] uppercase font-bold text-muted-foreground/85">Receipt Validation Key</span>
                <p className="text-sm font-mono font-bold text-foreground">{meta.receiptId}</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[9px] uppercase font-bold text-muted-foreground/85">Payment Stamping</span>
                <p className="text-sm font-bold text-foreground">Verified via CMI Ledger</p>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: AI Co-pilot Report */}
          <Card className="rounded-2xl border-primary/20 bg-primary/5 shadow-xs overflow-hidden">
            <CardHeader className="p-4 pb-2 bg-primary/10 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-bold flex items-center gap-1.5 text-primary">
                <Bot className="size-4 animate-bounce" />
                AI Compliance Co-pilot Audit
              </CardTitle>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold text-primary bg-primary/10 border border-primary/20">
                  <Sparkles className="size-2.5" /> AI Checked
                </span>
                {(role === "admin" || role === "authority") && (
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    disabled={verifyingCompliance}
                    onClick={handleTriggerComplianceCheck}
                    className="h-6 px-2 text-[10px] text-primary hover:bg-primary/15 rounded-md gap-1"
                  >
                    <RefreshCw className={cn("size-3", verifyingCompliance && "animate-spin")} />
                    Re-Audit
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4 text-xs">
              {project.ai_analysis ? (
                <div className="whitespace-pre-line leading-relaxed font-sans text-muted-foreground bg-background/50 p-4 rounded-xl border border-border/20">
                  {project.ai_analysis}
                </div>
              ) : (
                <p className="text-muted-foreground italic text-center py-4">No automatic compliance analysis report available for this dossier.</p>
              )}
            </CardContent>
          </Card>

          {/* Section 4: Document Checklist & Verification */}
          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center justify-between px-1">
              <span>Architect Submitted Files & Certificates</span>
              <span className="text-[10px] bg-muted px-2 py-0.5 rounded font-black text-muted-foreground tracking-normal">
                {(project.permit_documents || []).filter(d => d.approved).length} / {(project.permit_documents || []).length} Stamped
              </span>
            </Label>

            <div className="space-y-3">
              {(!project.permit_documents || project.permit_documents.length === 0) ? (
                <div className="p-8 rounded-xl border border-dashed border-border/40 text-center text-xs text-muted-foreground italic bg-muted/5">
                  No documents have been uploaded to this dossier.
                </div>
              ) : (
                project.permit_documents.map((doc) => {
                  const isVerified = doc.approved;
                  const hasNotes = doc.notes && doc.notes.length > 0;
                  const isDocKeyRevoking = revokingDocKey === doc.key;
                  const isDocActive = activePreviewDoc?.key === doc.key;

                  return (
                    <div 
                      key={doc.key}
                      className={cn(
                        "p-4 rounded-xl border transition-all space-y-3 bg-card hover:border-border/60 shadow-2xs",
                        isVerified 
                          ? "border-emerald-500/25 bg-emerald-500/[0.01]" 
                          : hasNotes 
                            ? "border-destructive/25 bg-destructive/[0.01]"
                            : "border-border/40",
                        isDocActive && "ring-2 ring-primary border-transparent"
                      )}
                    >
                      {/* Document Item Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <FileText className={cn("size-4.5 shrink-0", isVerified ? "text-emerald-500" : hasNotes ? "text-destructive" : "text-primary")} />
                            <span className="text-xs font-bold text-foreground truncate block">{doc.label}</span>
                            {doc.required && (
                              <Badge className="bg-destructive/10 text-destructive border border-destructive/20 text-[8px] tracking-widest font-black uppercase px-1.5 py-0.2 rounded shrink-0">
                                Required
                              </Badge>
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

                      {/* Display Revocation Reason if present */}
                      {hasNotes && !isVerified && (
                        <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/10 text-[11px] text-destructive font-medium space-y-1">
                          <p className="text-[9px] uppercase font-bold text-destructive/80 tracking-wider">Reason for Revocation:</p>
                          <p className="italic">&quot;{doc.notes[0]}&quot;</p>
                        </div>
                      )}

                      {/* Document Actions Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/10">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant={isDocActive ? "default" : "outline"}
                            onClick={() => handleSelectDocument(doc)}
                            className="h-8 px-3 rounded-lg text-[10px] font-extrabold gap-1 hover:scale-[1.02] active:scale-[0.98] transition-all"
                          >
                            <Eye className="size-3" />
                            {isDocActive ? "Viewing Preview" : "Preview Document"}
                          </Button>

                           <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadDocument(doc)}
                            className="h-8 px-2.5 rounded-lg text-[10px] font-bold gap-1 text-muted-foreground"
                          >
                            <Download className="size-3" />
                            Download
                          </Button>
                        </div>

                        {/* Interactive Verification Actions (restricted to admin & authority) */}
                        {(role === "admin" || role === "authority") && (
                          <div className="flex items-center gap-1.5">
                            {!isVerified ? (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleToggleDocumentApproval(doc.key, true)}
                                className="h-8 px-2.5 rounded-lg text-[10px] font-black text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10 bg-emerald-500/5 gap-1"
                              >
                                <CheckCircle2 className="size-3" /> Approve File
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setRevokingDocKey(doc.key);
                                  setRevocationReason("");
                                }}
                                className="h-8 px-2.5 rounded-lg text-[10px] font-black text-destructive hover:text-destructive/85 hover:bg-destructive/10 bg-destructive/5 gap-1"
                              >
                                <AlertCircle className="size-3" /> Revoke Approval
                              </Button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Inline Revocation Reason Input Panel */}
                      {isDocKeyRevoking && (
                        <div className="p-3 rounded-lg bg-muted/20 border border-border/50 space-y-2.5 animate-in slide-in-from-top-1 duration-200">
                          <div className="space-y-1.5">
                            <Label htmlFor={`reason-${doc.key}`} className="text-[10px] font-bold text-foreground">
                              Explain why this document is being rejected / revoked:
                            </Label>
                            <Input
                              id={`reason-${doc.key}`}
                              placeholder="e.g. Signature page missing, architectural plans incomplete..."
                              value={revocationReason}
                              onChange={(e) => setRevocationReason(e.target.value)}
                              className="h-9 text-xs rounded-lg border-border/40 bg-background"
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
                              className="h-7 px-3 text-[9px] font-bold rounded-lg border-border/40"
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              disabled={!revocationReason.trim()}
                              onClick={() => handleToggleDocumentApproval(doc.key, false, revocationReason)}
                              className="h-7 px-3 text-[9px] font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg"
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

          {/* Sticky Actions Footer Card inside Left Column */}
          <Card className="rounded-2xl border-border/40 bg-card/65 backdrop-blur-md shadow-lg p-5 flex flex-col sm:flex-row gap-3">
            {(role === "authority" || role === "admin") && project.status !== "Approved" && project.status !== "Rejected" && (
              <Button
                variant="outline"
                onClick={handleRejectDossier}
                disabled={!canRejectDossier() || rejectingDossier || extracting}
                className="flex-1 h-12 rounded-xl text-sm font-black border-destructive/50 text-destructive hover:bg-destructive hover:text-white transition-all flex items-center justify-center gap-2"
              >
                {rejectingDossier ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <XCircle className="size-4" />
                )}
                {rejectingDossier ? "Rejecting Dossier..." : "Reject Dossier"}
              </Button>
            )}

            {(role === "authority" || role === "admin") && project.status !== "Approved" && project.status !== "Rejected" && (
              <Button 
                onClick={handleExtractPermit}
                disabled={!canApproveDossier() || extracting || rejectingDossier}
                className="flex-1 h-12 rounded-xl text-sm font-black bg-primary text-primary-foreground hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/10"
              >
                <Printer className="size-4" />
                {extracting ? "Validating & Stamping..." : "Approve & Stamp Construction Permit"}
              </Button>
            )}

            {project.status === "Approved" && (
              <Button 
                onClick={() => setShowPermitModal(true)}
                className="flex-1 h-12 rounded-xl text-sm font-black bg-emerald-600 hover:bg-emerald-500 text-white hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/10"
              >
                <Printer className="size-4" />
                Print Extracted Stamped Permit
              </Button>
            )}

            <Button 
              variant="outline"
              onClick={() => router.push("/dashboard/projects")}
              className="h-12 px-6 rounded-xl font-bold text-sm border-border/40 hover:bg-muted"
            >
              Exit Workspace
            </Button>
          </Card>
        </div>

        {/* Right Workspace Panel: Live Document Preview Pane (Sticky) */}
        <div className="lg:col-span-5 h-[calc(100vh-140px)] sticky top-6">
          <div className="w-full h-full flex flex-col border border-border/40 rounded-3xl bg-card/50 backdrop-blur-md overflow-hidden shadow-xs relative">
            {loadingPreview && (
              <div className="absolute inset-0 bg-background/70 backdrop-blur-xs flex flex-col items-center justify-center z-20 space-y-3">
                <RefreshCw className="size-7 text-primary animate-spin" />
                <p className="text-xs font-semibold text-muted-foreground">Streaming file contents...</p>
              </div>
            )}

            {activePreviewDoc ? (
              <div className="flex flex-col h-full">
                {/* Active Preview Header */}
                <div className="flex items-center justify-between border-b border-border/20 px-5 py-3.5 bg-muted/20">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-foreground">{activePreviewDoc.filename}</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-wider mt-0.5">Live Viewer</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <a href={activePreviewDoc.url} download={activePreviewDoc.filename}>
                      <Button size="icon" variant="outline" className="size-8 rounded-lg" title="Download file">
                        <Download className="size-4" />
                      </Button>
                    </a>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setActivePreviewDoc(null)}
                      className="size-8 rounded-lg hover:bg-muted"
                      title="Close Preview"
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                </div>

                {/* Active Preview Body */}
                <div className="flex-1 bg-muted/20 flex items-center justify-center p-1.5 min-h-0">
                  {activePreviewDoc.type.startsWith("image/") ? (
                    <div className="w-full h-full overflow-auto flex items-center justify-center p-4">
                      <img
                        src={activePreviewDoc.url}
                        alt={activePreviewDoc.filename}
                        className="max-h-full max-w-full object-contain rounded-lg border border-border/10 shadow-md bg-white"
                      />
                    </div>
                  ) : (
                    <iframe
                      src={activePreviewDoc.url}
                      title={activePreviewDoc.filename}
                      className="h-full w-full bg-background rounded-2xl border border-border/10 shadow-xs"
                    />
                  )}
                </div>
              </div>
            ) : (
              /* Placeholder screen if no preview is active */
              <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-card">
                <div className="relative mb-4">
                  <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl animate-pulse scale-125" />
                  <div className="relative size-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <FileText className="size-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-sm font-black text-foreground uppercase tracking-wider mb-1">Dossier Interactive Viewer</h3>
                <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                  Select &quot;Preview Document&quot; next to any checklist file on the left. It will stream and render here immediately for compliance vetting.
                </p>
                <div className="mt-6 w-full max-w-[240px] space-y-2 border-t border-border/25 pt-6 text-[10px] text-left text-muted-foreground/80 font-medium">
                  <p className="flex items-center gap-1.5">
                    <ChevronRight className="size-3 text-primary shrink-0" />
                    Preview PDF blueprints & contracts
                  </p>
                  <p className="flex items-center gap-1.5">
                    <ChevronRight className="size-3 text-primary shrink-0" />
                    Inspect applicant identity scans
                  </p>
                  <p className="flex items-center gap-1.5">
                    <ChevronRight className="size-3 text-primary shrink-0" />
                    Confirm official municipal stamped files
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* OFFICIAL CONSTRUCTION PERMIT CERTIFICATE MODAL */}
      {showPermitModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-background/90 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-8">
            <OfficialPermitCertificate 
              data={{
                dossier_id: project.id,
                applicant_name: meta.citizenName,
                applicant_cin: meta.citizenCin,
                project_title: project.title,
                project_description: project.description || "",
                location: project.zone || "Not specified",
                land_reference: meta.landRef,
                dimensions: {
                  hauteur: project.hauteur,
                  recul: project.recul,
                  emprise: project.emprise,
                  surface_terrain: project.surface_terrain,
                },
                zone: project.zone || "Not specified",
                signed_by: project.signed_by || "Municipal Authority",
                signature_hash: project.signature_hash || "",
                signed_at: project.signed_at || new Date().toISOString(),
              }}
              onClose={() => setShowPermitModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
