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
  Trash2,
  Send,
  Printer,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { OfficialBusinessPermitCertificate } from "@/components/OfficialBusinessPermitCertificate";
import { Textarea } from "@/components/ui/textarea";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");

interface Document {
  key: string;
  filename: string;
  url: string;
  approved?: boolean;
  required?: boolean;
  notes?: string;
}

interface BusinessPermit {
  id: string;
  business_name: string;
  business_type: string;
  business_description: string;
  address: string;
  zone?: string;
  surface_area?: number;
  applicant_name: string;
  applicant_cin: string;
  owner_id: string;
  status: string;
  created_at: string;
  permit_documents: Document[];
  signed_by?: string;
  signature_hash?: string;
  signed_at?: string;
}

export default function PermitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const permitId = params.id as string;
  
  const { token, user: authUser } = useAuth();
  const role = authUser?.role || "citizen";
  
  const [permit, setPermit] = useState<BusinessPermit | null>(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [rejectionNotes, setRejectionNotes] = useState<{ [key: string]: string }>({});
  const [showCertificate, setShowCertificate] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPermit() {
      if (!token || !permitId) return;
      try {
        const response = await fetch(`${API_URL}/api/v1/business-permits/${permitId}`, {
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

  const handleToggleDocumentApproval = (docKey: string, approved: boolean) => {
    setDocuments(prev =>
      prev.map(doc =>
        doc.key === docKey ? { ...doc, approved } : doc
      )
    );
  };

  const handleSetRejectionNote = (docKey: string, note: string) => {
    setRejectionNotes(prev => ({
      ...prev,
      [docKey]: note
    }));
  };

  const canApprove = () => {
    if (!permit) return false;
    // Check if all required documents are approved
    const requiredDocs = documents.filter(doc => doc.required !== false);
    return requiredDocs.length > 0 && requiredDocs.every(doc => doc.approved);
  };

  const handleApprovePermit = async () => {
    if (!permit || !token) return;
    
    setApproving(true);
    try {
      // Update permit status with new documents and approval
      const updatePayload = {
        status: "Approved",
        permit_documents: documents.map(doc => ({
          key: doc.key,
          filename: doc.filename,
          url: doc.url,
          approved: doc.approved || false,
          required: doc.required,
          notes: rejectionNotes[doc.key] || doc.notes || ""
        }))
      };

      const response = await fetch(`${API_URL}/api/v1/business-permits/${permitId}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updatePayload)
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

  const handleDownloadDocument = async (docKey: string, filename: string) => {
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/api/v1/business-permits/${permitId}/documents/${filename}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to download document");
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
  const isOwner = authUser?.id === permit.owner_id;
  const canReview = isAuthority && permit.status !== "Approved";

  return (
    <div className="space-y-8 px-4 py-6 max-w-5xl mx-auto">
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
      <Card className="bg-muted/30 border-border/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Permit Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase">Business Name</p>
                  <p className="font-semibold">{permit.business_name}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase">Business Type</p>
                  <p className="font-semibold">{permit.business_type}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase">Address</p>
                  <p className="font-semibold">{permit.address}</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase">Applicant Name</p>
                  <p className="font-semibold">{permit.applicant_name}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase">CIN/ID</p>
                  <p className="font-semibold">{permit.applicant_cin}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase">Submitted Date</p>
                  <p className="font-semibold">{new Date(permit.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border/40">
            <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Description</p>
            <p className="text-sm">{permit.business_description}</p>
          </div>
        </CardContent>
      </Card>

      {/* Documents Section */}
      <Card className="bg-card border-border/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileCheck className="w-5 h-5" />
            Required Documents
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {documents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>No documents submitted</p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.key}
                  className={cn(
                    "p-4 rounded-lg border border-border/40 bg-card hover:bg-muted/5 transition-colors",
                    doc.approved && "border-emerald-500/30 bg-emerald-500/5"
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <p className="font-semibold text-sm">{doc.filename}</p>
                        {doc.required !== false && (
                          <Badge variant="outline" className="text-xs">Required</Badge>
                        )}
                      </div>
                      {isAuthority && canReview && (
                        <div className="space-y-3 mt-3 pt-3 border-t border-border/40">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={doc.approved || false}
                              onChange={(e) => handleToggleDocumentApproval(doc.key, e.target.checked)}
                              className="w-4 h-4 rounded"
                            />
                            <span className="text-sm font-medium">Approve this document</span>
                          </label>
                          <div className="space-y-2">
                            <label className="flex items-center gap-2 text-xs font-medium">
                              <MessageSquare className="w-3 h-3" />
                              Notes / Rejection Reason
                            </label>
                            <Textarea
                              placeholder="Add notes for applicant or rejection reason..."
                              value={rejectionNotes[doc.key] || doc.notes || ""}
                              onChange={(e) => handleSetRejectionNote(doc.key, e.target.value)}
                              className="text-xs h-20 resize-none rounded-lg"
                            />
                          </div>
                        </div>
                      )}
                      {!canReview && (
                        <div className="flex items-center gap-2 mt-2">
                          {doc.approved ? (
                            <Badge className="bg-emerald-500/10 text-emerald-600 gap-1 text-xs">
                              <CheckCircle2 className="w-3 h-3" />
                              Approved
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-500/10 text-amber-600 gap-1 text-xs">
                              <AlertCircle className="w-3 h-3" />
                              Pending
                            </Badge>
                          )}
                          {doc.notes && (
                            <p className="text-xs text-muted-foreground italic">"{doc.notes}"</p>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1"
                        onClick={() => handleDownloadDocument(doc.key, doc.filename)}
                      >
                        <Download className="w-3 h-3" />
                        <span className="hidden sm:inline">Download</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1"
                        onClick={() => setPreviewDoc(doc.url)}
                      >
                        <Eye className="w-3 h-3" />
                        <span className="hidden sm:inline">View</span>
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
        <Card className="bg-emerald-500/5 border-emerald-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
              Signature Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase">Signed By</p>
                <p className="font-semibold">{permit.signed_by}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase">Signed At</p>
                <p className="font-semibold">{new Date(permit.signed_at || "").toLocaleString()}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Signature Hash</p>
              <p className="font-mono text-xs break-all bg-background p-2 rounded border border-border/40">{permit.signature_hash}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      {canReview && (
        <div className="flex items-center justify-between sticky bottom-0 bg-background/95 backdrop-blur p-4 rounded-lg border border-border/40 shadow-lg">
          <p className="text-sm font-medium text-muted-foreground">
            {canApprove()
              ? "All required documents approved. Ready to sign and issue permit."
              : "Approve all required documents to proceed."}
          </p>
          <Button
            size="lg"
            onClick={handleApprovePermit}
            disabled={!canApprove() || approving}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700"
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
    </div>
  );
}
