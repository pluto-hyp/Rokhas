"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Download,
  Eye,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileText,
  Calendar,
  MapPin,
  Building2,
  User,
  FileCheck,
  Send,
  Printer,
  MessageSquare,
  X,
  Clock,
  XCircle,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { OfficialBusinessPermitCertificate } from "@/components/OfficialBusinessPermitCertificate";
import { Textarea } from "@/components/ui/textarea";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "/api/v1").replace(/\/+$/, "");

const DOCUMENT_LABELS: Record<string, string> = {
  owner_id_card: "Copy of Owner ID Card (CIN)",
  commercial_register: "Commercial Register (RC)",
  tax_patent: "Tax Patent (Patente / IF)",
  premises_lease: "Lease Agreement / Title Deed",
  zoning_plan: "Location or Zoning Plan",
  environmental_audit: "Environmental Impact Audit",
};

interface Document {
  key: string;
  filename: string;
  url: string;
  approved?: boolean;
  required?: boolean;
  notes?: string[] | string;
}

interface BusinessPermit {
  id: number;
  business_name: string;
  business_type: string;
  business_description: string;
  address: string;
  zone?: string;
  surface_area?: number;
  applicant_name: string;
  applicant_cin: string;
  owner_id: number;
  status: string;
  created_at: string;
  permit_documents: Document[];
  ai_analysis?: string;
  signed_by?: string;
  signature_hash?: string;
  signed_at?: string;
}

type PreviewDocument = {
  filename: string;
  type: string;
  url: string;
};

export default function PermitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const permitId = params.id as string;
  
  const { token, user: authUser } = useAuth();
  const role = authUser?.role || "citizen";
  
  const [permit, setPermit] = useState<BusinessPermit | null>(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [rejectionNotes, setRejectionNotes] = useState<{ [key: string]: string }>({});
  const [openRejectPanels, setOpenRejectPanels] = useState<{ [key: string]: boolean }>({});
  const [showCertificate, setShowCertificate] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<PreviewDocument | null>(null);

  useEffect(() => {
    async function fetchPermit() {
      if (!token || !permitId) return;
      try {
        const response = await fetch(`${API_BASE_URL}/business-permits/${permitId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const data: BusinessPermit = await response.json();
          setPermit(data);
          setDocuments(data.permit_documents || []);
        } else {
          toast.error("Failed to load permit");
        }
      } catch (err) {
        console.error(err);
        toast.error("Error loading permit details");
      } finally {
        setLoading(false);
      }
    }
    fetchPermit();
  }, [token, permitId]);

  useEffect(() => {
    if (permit?.business_name) {
      const event = new CustomEvent("rokhas-breadcrumb-override", {
        detail: permit.business_name
      });
      window.dispatchEvent(event);
    }
  }, [permit]);

  useEffect(() => {
    return () => {
      // Only revoke object URLs (not Vercel blob URLs which are persistent)
      if (previewDoc?.url && !previewDoc.url.includes("blob.vercel-storage.com")) {
        URL.revokeObjectURL(previewDoc.url);
      }
    };
  }, [previewDoc]);

  const getDocumentNotesText = (notes: Document["notes"]) => {
    if (Array.isArray(notes)) return notes.join("; ");
    return notes || "";
  };

  const getDocumentFilename = (doc: Document) => {
    if (!doc.url) return doc.filename;

    try {
      const parsedUrl = new URL(doc.url, window.location.origin);
      const filenameFromUrl = decodeURIComponent(parsedUrl.pathname.split("/").pop() || "");
      return filenameFromUrl || doc.filename;
    } catch {
      return doc.filename;
    }
  };

  const getDocumentEndpoint = (doc: Document) => {
    const filename = getDocumentFilename(doc);
    return `${API_BASE_URL}/business-permits/${permitId}/documents/${encodeURIComponent(filename)}`;
  };

  const fetchDocumentBlob = async (doc: Document) => {
    if (!token) {
      throw new Error("Your session has expired. Please sign in again.");
    }

    const primaryEndpoint = getDocumentEndpoint(doc);
    const response = await fetch(primaryEndpoint, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.ok) {
      return response.blob();
    }

    // Fallback: try the doc's stored URL directly (temporary docs)
    if (doc.url && response.status === 404) {
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

  const handleToggleDocumentApproval = (docKey: string, approved: boolean) => {
    setDocuments(prev =>
      prev.map(doc =>
        doc.key === docKey ? { ...doc, approved } : doc
      )
    );
    if (approved) {
      setOpenRejectPanels(prev => ({ ...prev, [docKey]: false }));
    }
  };

  const handleSetRejectionNote = (docKey: string, note: string) => {
    setRejectionNotes(prev => ({
      ...prev,
      [docKey]: note
    }));
  };

  const toggleRejectPanel = (docKey: string) => {
    setOpenRejectPanels(prev => ({ ...prev, [docKey]: !prev[docKey] }));
  };

  const canApprove = () => {
    if (!permit) return false;
    const requiredDocs = documents.filter(doc => doc.required !== false);
    return requiredDocs.length > 0 && requiredDocs.every(doc => doc.approved);
  };

  const buildPermitDocumentsPayload = () =>
    documents.map(doc => ({
      key: doc.key,
      filename: doc.filename,
      url: doc.url,
      approved: doc.approved || false,
      required: doc.required,
      notes: rejectionNotes[doc.key]?.trim()
        ? [rejectionNotes[doc.key].trim()]
        : Array.isArray(doc.notes)
          ? doc.notes
          : doc.notes
            ? [doc.notes]
            : []
    }));

  const handleApprovePermit = async () => {
    if (!permit || !token) return;
    setApproving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/business-permits/${permitId}`, {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Approved", permit_documents: buildPermitDocumentsPayload() })
      });
      if (response.ok) {
        const updatedPermit: BusinessPermit = await response.json();
        setPermit(updatedPermit);
        toast.success("Permit approved successfully!");
        setShowCertificate(true);
      } else {
        const err = await response.json();
        toast.error(err.detail || "Failed to approve permit");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error approving permit");
    } finally {
      setApproving(false);
    }
  };

  const handleRejectPermit = async () => {
    if (!permit || !token) return;
    const hasNotes = documents.some(doc => rejectionNotes[doc.key]?.trim());
    if (!hasNotes) {
      toast.error("Please provide a rejection reason for at least one document.");
      return;
    }
    setRejecting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/business-permits/${permitId}`, {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Rejected", permit_documents: buildPermitDocumentsPayload() })
      });
      if (response.ok) {
        const updatedPermit: BusinessPermit = await response.json();
        setPermit(updatedPermit);
        toast.success("Permit rejected and applicant notified.");
      } else {
        const err = await response.json();
        toast.error(err.detail || "Failed to reject permit");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error rejecting permit");
    } finally {
      setRejecting(false);
    }
  };

  const handleDownloadDocument = async (doc: Document) => {
    try {
      // If file is on Vercel Blob, download directly via anchor tag
      if (doc.url && doc.url.includes("blob.vercel-storage.com")) {
        const a = document.createElement("a");
        a.href = doc.url;
        a.download = getDocumentFilename(doc);
        a.target = "_blank";
        document.body.appendChild(a);
        a.click();
        a.remove();
        return;
      }

      const blob = await fetchDocumentBlob(doc);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = getDocumentFilename(doc);
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to download document");
    }
  };

  const inferMimeType = (blob: Blob, filename: string): Blob => {
    if (blob.type && blob.type !== "application/octet-stream") return blob;
    const lower = filename.toLowerCase();
    if (lower.endsWith(".pdf")) return new Blob([blob], { type: "application/pdf" });
    if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return new Blob([blob], { type: "image/jpeg" });
    if (lower.endsWith(".png")) return new Blob([blob], { type: "image/png" });
    if (lower.endsWith(".gif")) return new Blob([blob], { type: "image/gif" });
    return blob;
  };

  const handleViewDocument = async (doc: Document) => {
    try {
      // If file is on Vercel Blob, use public URL directly
      if (doc.url && doc.url.includes("blob.vercel-storage.com")) {
        const filename = getDocumentFilename(doc);
        let mimeType = "application/octet-stream";
        const lower = filename.toLowerCase();
        if (lower.endsWith(".pdf")) mimeType = "application/pdf";
        else if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) mimeType = "image/jpeg";
        else if (lower.endsWith(".png")) mimeType = "image/png";
        else if (lower.endsWith(".gif")) mimeType = "image/gif";
        setPreviewDoc({ filename, type: mimeType, url: doc.url });
        return;
      }

      let blob = await fetchDocumentBlob(doc);
      blob = inferMimeType(blob, getDocumentFilename(doc));
      const url = window.URL.createObjectURL(blob);
      setPreviewDoc({
        filename: getDocumentFilename(doc),
        type: blob.type,
        url
      });
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to open document preview");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!permit) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <p className="text-lg font-semibold">Permit not found</p>
        <Button onClick={() => router.back()} variant="outline">Go Back</Button>
      </div>
    );
  }

  const isAuthority = role === "authority" || role === "admin";
  const canReview = isAuthority && permit.status !== "Approved" && permit.status !== "Rejected";
  const canReject = canReview && documents.some(doc => !doc.approved);

  return (
    <div className="space-y-8 px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="h-10 w-10"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{permit.business_name}</h1>
          <p className="text-muted-foreground mt-1">Permit ID: {permit.id}</p>
        </div>
        <div className="flex items-center gap-2">
          {permit.status === "Approved" && (
            <Badge className="bg-emerald-500 text-white gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Approved
            </Badge>
          )}
          {permit.status === "Pending" && (
            <Badge className="bg-amber-500 text-white gap-1">
              <AlertCircle className="w-3 h-3" />
              Pending Review
            </Badge>
          )}
          {permit.status === "Under Review" && (
            <Badge className="bg-blue-500 text-white gap-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              Under Review
            </Badge>
          )}
          {permit.status === "Rejected" && (
            <Badge className="bg-destructive text-white gap-1">
              <XCircle className="w-3 h-3" />
              Rejected
            </Badge>
          )}
          {permit.status === "Approved" && (
            <Button
              size="sm"
              className="gap-2"
              onClick={() => setShowCertificate(true)}
            >
              <Printer className="w-4 h-4" />
              View Certificate
            </Button>
          )}
        </div>
      </div>

      {/* Permit Information */}
      <Card className="rounded-2xl border-border/40 bg-card shadow-sm overflow-hidden">
        <CardHeader className="p-6 pb-2">
          <CardTitle className="text-xl font-bold">Permit Information</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-3.5 rounded-xl bg-muted/10 border border-border/40 space-y-1">
              <Building2 className="size-4 text-primary" />
              <p className="text-[9px] font-bold text-muted-foreground uppercase mt-1">Business Name</p>
              <p className="text-xs font-bold text-foreground">{permit.business_name}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-muted/10 border border-border/40 space-y-1">
              <FileText className="size-4 text-primary" />
              <p className="text-[9px] font-bold text-muted-foreground uppercase mt-1">Business Type</p>
              <p className="text-xs font-bold text-foreground capitalize">{permit.business_type}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-muted/10 border border-border/40 space-y-1">
              <MapPin className="size-4 text-primary" />
              <p className="text-[9px] font-bold text-muted-foreground uppercase mt-1">Address</p>
              <p className="text-xs font-bold text-foreground truncate">{permit.address}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-muted/10 border border-border/40 space-y-1">
              <User className="size-4 text-primary" />
              <p className="text-[9px] font-bold text-muted-foreground uppercase mt-1">Applicant Name</p>
              <p className="text-xs font-bold text-foreground">{permit.applicant_name}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-muted/10 border border-border/40 space-y-1">
              <FileText className="size-4 text-primary" />
              <p className="text-[9px] font-bold text-muted-foreground uppercase mt-1">CIN/ID</p>
              <p className="text-xs font-bold text-foreground">{permit.applicant_cin}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-muted/10 border border-border/40 space-y-1">
              <Calendar className="size-4 text-primary" />
              <p className="text-[9px] font-bold text-muted-foreground uppercase mt-1">Submitted Date</p>
              <p className="text-xs font-bold text-foreground">{new Date(permit.created_at).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="pt-4 border-t border-border/40 space-y-2">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Description</p>
            <p className="text-xs text-foreground leading-relaxed">{permit.business_description || "Commercial business operations."}</p>
          </div>
        </CardContent>
      </Card>

      {/* Documents Section */}
      <Card className="rounded-2xl border-border/40 bg-card shadow-sm overflow-hidden">
        <CardHeader className="p-6 pb-2">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <FileCheck className="w-5 h-5" />
            Required Documents
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {documents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>No documents submitted</p>
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map((doc) => (
                <div
                  key={doc.key}
                  className={cn(
                    "p-3.5 rounded-xl border transition-all space-y-3 bg-background/50",
                    doc.approved 
                      ? "border-emerald-500/25 bg-emerald-500/[0.01]" 
                      : getDocumentNotesText(doc.notes)
                        ? "border-destructive/25 bg-destructive/[0.01]"
                        : "border-border/40"
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <FileText className={cn("size-4 shrink-0", doc.approved ? "text-emerald-500" : getDocumentNotesText(doc.notes) ? "text-destructive" : "text-primary")} />
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-foreground">{DOCUMENT_LABELS[doc.key] || doc.key}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{doc.filename}</p>
                        </div>
                        {doc.required !== false && (
                          <span className="text-[8px] bg-destructive/10 text-destructive border border-destructive/20 px-1.5 py-0.1 rounded font-black uppercase shrink-0">
                            Req
                          </span>
                        )}
                      </div>
                      
                      {isAuthority && canReview && (
                        <div className="space-y-3 mt-3 pt-3 border-t border-border/40">
                          <label className="flex items-center gap-3 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={doc.approved || false}
                              onChange={(e) => handleToggleDocumentApproval(doc.key, e.target.checked)}
                              className="w-4 h-4 rounded border-border/40 bg-background"
                            />
                            <span className="text-xs font-semibold">Approve this document</span>
                          </label>

                          {/* Reject panel — only visible when doc is NOT approved */}
                          {!doc.approved && (
                            <div className="space-y-2">
                              <button
                                type="button"
                                onClick={() => toggleRejectPanel(doc.key)}
                                className="flex items-center gap-1.5 text-xs font-semibold text-destructive hover:underline"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                Reject this document
                                <ChevronDown
                                  className={cn(
                                    "w-3 h-3 transition-transform",
                                    openRejectPanels[doc.key] ? "rotate-180" : ""
                                  )}
                                />
                              </button>

                              {openRejectPanels[doc.key] && (
                                <div className="space-y-2 animate-in slide-in-from-top-1 duration-150">
                                  <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    <MessageSquare className="w-3 h-3" />
                                    Rejection Reason
                                  </label>
                                  <Textarea
                                    placeholder="Explain why this document is being rejected..."
                                    value={rejectionNotes[doc.key]}
                                    onChange={(e) => handleSetRejectionNote(doc.key, e.target.value)}
                                    className="text-xs h-20 resize-none rounded-lg border-destructive/40 bg-destructive/5 focus:border-destructive"
                                    autoFocus
                                  />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {!canReview && (
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          {doc.approved ? (
                            <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[9px] hover:bg-emerald-500/15 font-bold gap-1 py-0.5">
                              <CheckCircle2 className="size-2.5" /> Approved
                            </Badge>
                          ) : getDocumentNotesText(doc.notes) ? (
                            <Badge className="bg-destructive/10 text-destructive border border-destructive/20 text-[9px] hover:bg-destructive/15 font-bold gap-1 py-0.5">
                              <AlertCircle className="size-2.5" /> Revoked
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[9px] hover:bg-amber-500/15 font-bold gap-1 py-0.5">
                              <Clock className="size-2.5" /> Pending
                            </Badge>
                          )}
                          {getDocumentNotesText(doc.notes) && (
                            <p className="text-xs text-muted-foreground italic">&quot;{getDocumentNotesText(doc.notes)}&quot;</p>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-9 px-3 rounded-lg text-[10px] font-bold"
                        onClick={() => handleDownloadDocument(doc)}
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Download
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-9 px-3 rounded-lg text-[10px] font-bold"
                        onClick={() => handleViewDocument(doc)}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Signature Information (if approved) */}
      {permit.status === "Approved" && permit.signed_by && (
        <Card className="rounded-2xl border-border/40 bg-emerald-500/5 border-emerald-500/20 overflow-hidden">
          <CardHeader className="p-6 pb-2 bg-emerald-500/[0.02]">
            <CardTitle className="text-lg flex items-center gap-2 text-emerald-600 font-bold">
              <CheckCircle2 className="w-5 h-5" />
              Signature Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase">Signed By</p>
                <p className="text-sm font-semibold">{permit.signed_by}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase">Signed At</p>
                <p className="text-sm font-semibold">{new Date(permit.signed_at || "").toLocaleString()}</p>
              </div>
            </div>
            <div className="pt-2">
              <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Signature Hash</p>
              <p className="font-mono text-xs break-all bg-background p-3 rounded-xl border border-border/40">{permit.signature_hash}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Compliance Analysis */}
      {permit.ai_analysis && (
        <Card className="rounded-2xl border-border/40 bg-card shadow-sm overflow-hidden">
          <CardHeader className="p-6 pb-2">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <span className="size-6 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <FileCheck className="size-4 text-primary" />
              </span>
              Agent Compliance Analysis
              <span className="text-[9px] uppercase tracking-widest bg-amber-500/10 text-amber-600 border border-amber-500/20 px-2 py-0.5 rounded-full font-black ml-auto">AI Report</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <pre className="whitespace-pre-wrap text-xs leading-relaxed text-foreground font-mono bg-muted/30 rounded-xl p-4 border border-border/30 max-h-[400px] overflow-auto">
              {permit.ai_analysis}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      {canReview && (
        <div className="flex items-center justify-between sticky bottom-0 bg-background/95 backdrop-blur p-4 rounded-xl border border-border/40 shadow-lg mt-8">
          <p className="text-xs font-bold text-muted-foreground">
            {canApprove()
              ? "All required documents approved. Ready to sign and issue permit."
              : canReject
                ? "Some documents are unchecked — you can reject the permit."
                : "Approve all required documents to proceed."}
          </p>
          <div className="flex items-center gap-2">
            {canReject && (
              <Button
                size="lg"
                variant="outline"
                onClick={handleRejectPermit}
                disabled={rejecting || approving}
                className="gap-2 border-destructive/50 text-destructive hover:bg-destructive hover:text-white rounded-xl h-11 px-5 text-xs font-bold"
              >
                {rejecting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    Reject Permit
                  </>
                )}
              </Button>
            )}
            <Button
              size="lg"
              onClick={handleApprovePermit}
              disabled={!canApprove() || approving || rejecting}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11 px-5 text-xs font-bold"
            >
              {approving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Approve & Sign Permit
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Certificate Modal */}
      {showCertificate && permit.status === "Approved" && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-background/90 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-8">
            <OfficialBusinessPermitCertificate
              data={{
                dossier_id: permit.id,
                applicant_name: permit.applicant_name,
                applicant_cin: permit.applicant_cin,
                business_name: permit.business_name,
                business_type: permit.business_type,
                business_description: permit.business_description,
                location: permit.address,
                land_reference: `PERMIT-${permit.id}`,
                dimensions: { surface_terrain: permit.surface_area || 0 },
                zone: permit.zone || "Commercial",
                signed_by: permit.signed_by || "Municipal Authority",
                signature_hash: permit.signature_hash || "",
                signed_at: permit.signed_at || new Date().toISOString(),
              }}
              onClose={() => setShowCertificate(false)}
            />
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-background/90 p-4 backdrop-blur-md">
          <div className="flex h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-border/40 bg-card shadow-2xl">
            <div className="flex items-center justify-between gap-4 border-b border-border/40 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{previewDoc.filename}</p>
                <p className="text-xs text-muted-foreground">Document preview</p>
              </div>
              <div className="flex items-center gap-2">
                <a href={previewDoc.url} download={previewDoc.filename}>
                  <Button size="sm" variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </a>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setPreviewDoc(null)}
                  aria-label="Close document preview"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex min-h-0 flex-1 items-center justify-center bg-muted/30">
              {previewDoc.type.startsWith("image/") ? (
                <img
                  src={previewDoc.url}
                  alt={previewDoc.filename}
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <iframe
                  src={previewDoc.url}
                  title={previewDoc.filename}
                  className="h-full w-full bg-background"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
