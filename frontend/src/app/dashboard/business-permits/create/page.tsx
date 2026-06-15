"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError, BusinessPermitDocument, createBusinessPermit, uploadTemporaryDocument } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Loader2, 
  UploadCloud, 
  FileText, 
  CreditCard, 
  Building2, 
  ShieldCheck, 
  ArrowLeft,
  Sparkles,
  FileCheck,
  MapPin,
  Leaf,
  AlertTriangle,
  CheckCircle2,
  X
} from "lucide-react";

const BUSINESS_TYPES = [
  "Restaurant",
  "Café",
  "Coffee Shop",
  "Shop",
  "Supermarket",
  "Hair Salon",
  "Beauty Center",
  "Pharmacy",
  "Medical Clinic",
  "Dental Clinic",
  "Gym/Fitness Center",
  "Hotel",
  "Hostel",
  "Office Space",
  "Warehouse",
  "Workshop",
  "Factory",
  "Other"
];

const ZONES = [
  { value: "Zone A - Residential", label: "Zone A — Résidentielle" },
  { value: "Zone B - Commercial", label: "Zone B — Commerciale (Audit requis)" },
  { value: "Zone C - Industrial", label: "Zone C — Industrielle" },
  { value: "Zone D - Mixed Use", label: "Zone D — Usage Mixte" },
  { value: "Central Commercial Zone", label: "Zone Commerciale Centrale" },
  { value: "Other", label: "Autre / Non spécifiée" },
];

type RequiredDocument = {
  key: string;
  label: string;
  helper: string;
  required?: boolean;
  conditional?: boolean;
  conditionLabel?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
};

const REQUIRED_DOCUMENTS: RequiredDocument[] = [
  { key: "owner_id_card", label: "Copy of Owner ID Card (CIN)", helper: "Carte Nationale d'Identité", icon: CreditCard },
  { key: "commercial_register", label: "Commercial Register (RC)", helper: "Registre du Commerce", icon: Building2 },
  { key: "tax_patent", label: "Tax Patent (Patente / IF)", helper: "Identifiant Fiscal copy", icon: FileText },
  { key: "premises_lease", label: "Lease Agreement / Title Deed", helper: "Contrat de bail or titre de propriété", icon: ShieldCheck },
];

const OPTIONAL_DOCUMENTS: RequiredDocument[] = [
  { key: "zoning_plan", label: "Location or Zoning Plan", helper: "Plan de situation (Optionnel)", required: false, icon: MapPin },
];

const ZONE_B_DOCUMENT: RequiredDocument = {
  key: "environmental_audit",
  label: "Environmental Impact Audit",
  helper: "Audit d'impact environnemental — requis en Zone B",
  required: true,
  conditional: true,
  conditionLabel: "Zone B Required",
  icon: Leaf,
};

type UploadedFile = {
  name: string;
  size: string;
  approved?: boolean;
  notes?: string[];
  url?: string;
};

export default function CreateBusinessPermitPage() {
  const router = useRouter();
  const { token, user: authUser } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [files, setFiles] = React.useState<{ [key: string]: UploadedFile }>({});
  const fileInputRefs = React.useRef<{ [key: string]: HTMLInputElement | null }>({});

  const [formData, setFormData] = React.useState({
    business_name: "",
    business_type: "",
    business_description: "",
    address: "",
    zone: "",
    surface_area: "",
    applicant_name: authUser?.full_name || "",
    applicant_cin: ""
  });

  const isZoneB = formData.zone.toLowerCase().includes("zone b");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (field: string) => (value: string | null) => {
    if (!value) return;
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const triggerFileInput = (key: string) => {
    fileInputRefs.current[key]?.click();
  };

  const removeFile = (key: string) => {
    setFiles(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    // Reset the input
    if (fileInputRefs.current[key]) {
      fileInputRefs.current[key]!.value = "";
    }
  };

  const handleFileChange = (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    const sizeStr = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${(file.size / 1024).toFixed(0)} KB`;

    toast.promise(
      (async () => {
        const uploadResult = await uploadTemporaryDocument(file, token);

        setFiles(prev => ({
          ...prev,
          [key]: {
            name: file.name,          // Always use the original file name
            size: sizeStr,
            url: uploadResult.url,
            approved: true,
            notes: ["File uploaded and stored."],
          },
        }));

        return uploadResult;
      })(),
      {
        loading: `Uploading ${file.name}...`,
        success: () => {
          // Auto-fill CIN from filename
          const cinMatch = file.name.match(/\b([A-Z]{1,2}\d{5,6})\b/i);
          if (cinMatch && !formData.applicant_cin) {
            setFormData(prev => ({ ...prev, applicant_cin: cinMatch[1].toUpperCase() }));
            toast.info(`Extracted CIN: ${cinMatch[1].toUpperCase()}`);
          }
          return `${file.name} uploaded successfully!`;
        },
        error: (err) => err instanceof Error ? err.message : "Upload failed",
      }
    );

    // AI analysis
    (async () => {
      try {
        const resp = await fetch('/api/v1/agent/analyze-file', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, preview: "" })
        });
        if (resp.ok) {
          const data = await resp.json();
          const notes = data.notes || [];
          const message = data.message || "";
          const reviewRequired = !!data.review_required
            || notes.some((note: string) => /agent unavailable|fallback|indisponible/i.test(note))
            || /agent unavailable|fallback|indisponible/i.test(message);
          const approved = reviewRequired ? true : !!data.approved;

          setFiles(prev => {
            const existing = prev[key];
            if (!existing) return prev;
            return {
              ...prev,
              [key]: { ...existing, approved, notes: [...(existing?.notes || []), ...notes] }
            };
          });

          if (reviewRequired) {
            toast.warning(`${file.name} accepted for manual authority review (AI agent offline).`);
          } else if (!approved) {
            toast.error(`${file.name} flagged: ${message || 'Further review required.'}`);
          }
        }
      } catch (err) {
        console.error('File analysis error', err);
      }
    })();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("Your session has expired. Please sign in again before submitting.");
      return;
    }

    if (!formData.business_name || !formData.business_type || !formData.address || !formData.applicant_cin) {
      toast.error("Please fill in all required fields");
      return;
    }

    const missingRequired = REQUIRED_DOCUMENTS.filter(doc => !files[doc.key]);
    if (missingRequired.length > 0) {
      toast.error(`Please upload all mandatory documents: ${missingRequired.map(d => d.label).join(", ")}`);
      return;
    }

    if (isZoneB && !files[ZONE_B_DOCUMENT.key]) {
      toast.error("Zone B activities require an Environmental Impact Audit document.");
      return;
    }

    setLoading(true);

    try {
      toast.loading("Creating business permit request...", { id: "submit" });

      const allDocs = [
        ...REQUIRED_DOCUMENTS,
        ...OPTIONAL_DOCUMENTS,
        ...(isZoneB ? [ZONE_B_DOCUMENT] : []),
      ];

      const permitDocuments: BusinessPermitDocument[] = allDocs
        .filter((doc) => files[doc.key])
        .map((doc) => ({
          key: doc.key,
          filename: files[doc.key]?.name || "",
          url: files[doc.key]?.url,
          approved: files[doc.key]?.approved !== false,
          required: doc.required !== false,
          notes: files[doc.key]?.notes || [],
        }));

      const permit = await createBusinessPermit({
        ...formData,
        surface_area: formData.surface_area ? parseInt(formData.surface_area) : null,
        permit_documents: permitDocuments
      }, token);

      toast.success("Business permit request submitted successfully!", { id: "submit" });
      router.push(`/dashboard/business-permits/${permit.id}`);
    } catch (error) {
      const errorMsg = error instanceof ApiError && error.status === 401
        ? "Your session has expired. Please sign in again before submitting."
        : error instanceof Error
          ? error.message
          : "Failed to submit permit";
      toast.error(errorMsg, { id: "submit" });
    } finally {
      setLoading(false);
    }
  };

  const renderDocumentUpload = (doc: RequiredDocument) => {
    const uploadedFile = files[doc.key];
    const Icon = doc.icon;

    return (
      <div key={doc.key} className="space-y-1">
        {doc.conditional && (
          <div className="flex items-center gap-1.5 mb-1">
            <AlertTriangle className="size-3 text-amber-500" />
            <p className="text-[9px] font-black uppercase tracking-widest text-amber-600">{doc.conditionLabel}</p>
          </div>
        )}
        <div
          onClick={() => !uploadedFile && triggerFileInput(doc.key)}
          className={`flex w-full min-w-0 items-center justify-between gap-2 p-3 rounded-xl border-2 border-dashed transition-all ${uploadedFile
            ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-500"
            : doc.conditional
              ? "border-amber-500/40 bg-amber-500/5 cursor-pointer hover:border-amber-500/60"
              : "border-border/40 hover:border-primary/40 hover:bg-muted/30 cursor-pointer"
          }`}
        >
          <input
            type="file"
            ref={(el) => { fileInputRefs.current[doc.key] = el; }}
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            onChange={(e) => handleFileChange(doc.key, e)}
          />
          <div className="flex min-w-0 flex-1 items-center gap-2 text-sm">
            <div className={`p-2 rounded-lg shrink-0 ${uploadedFile ? "bg-emerald-500 text-white" : doc.conditional ? "bg-amber-500/20 text-amber-600" : "bg-muted text-muted-foreground"}`}>
              <Icon size={16} />
            </div>
            <div className="text-left min-w-0">
              <p className="font-bold text-foreground text-xs">
                {uploadedFile ? uploadedFile.name : doc.label}
              </p>
              <p className={`text-[10px] truncate ${uploadedFile
                ? "text-emerald-600"
                : doc.required === false
                  ? "text-muted-foreground"
                  : doc.conditional
                    ? "text-amber-600 font-bold"
                    : "text-amber-600 font-bold"
              }`}>
                {uploadedFile
                  ? `${uploadedFile.size} • ${uploadedFile.approved === false ? "⚠ Flagged for review" : "✓ Accepted"}`
                  : doc.helper
                }
              </p>
            </div>
          </div>
          {uploadedFile ? (
            <div className="flex items-center gap-1 shrink-0">
              <CheckCircle2 className="size-4 text-emerald-500" />
              <button
                type="button"
                onClick={(ev) => { ev.stopPropagation(); removeFile(doc.key); }}
                className="p-0.5 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                title="Remove file"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ) : (
            <UploadCloud size={18} className={doc.conditional ? "text-amber-500 shrink-0" : "text-muted-foreground shrink-0"} />
          )}
        </div>
      </div>
    );
  };

  const uploadedCount = Object.keys(files).length;
  const requiredCount = REQUIRED_DOCUMENTS.length + (isZoneB ? 1 : 0);
  const requiredUploaded = REQUIRED_DOCUMENTS.filter(d => files[d.key]).length + (isZoneB && files[ZONE_B_DOCUMENT.key] ? 1 : 0);

  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8 max-w-5xl mx-auto w-full relative">
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
              New Economic Authorization
            </h1>
            <p className="text-base text-muted-foreground font-medium">
              Submit your business activity authorization request directly to the municipal desk.
            </p>
          </div>
          <Link href="/dashboard/business-permits">
            <Button variant="outline" className="h-11 gap-2 rounded-xl border-border/40 hover:bg-muted font-bold transition-all hover:scale-[1.02] active:scale-[0.98]">
              <ArrowLeft className="size-4" />
              Back to Permits
            </Button>
          </Link>
        </div>

        <Separator className="mt-2" />

        <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-7 pt-4">
          {/* Main Form Fields */}
          <div className="lg:col-span-4 space-y-6">
            {/* Business Information */}
            <Card className="rounded-2xl border-border/40 bg-card shadow-sm overflow-hidden">
              <CardHeader className="p-6 pb-2">
                <CardTitle className="text-xl font-bold">Business Information</CardTitle>
                <CardDescription className="text-sm">
                  Details about the commercial entity you wish to register.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="business_name" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Business Name *
                    </Label>
                    <Input
                      id="business_name"
                      name="business_name"
                      placeholder="e.g., Al-Baraka Restaurant"
                      value={formData.business_name}
                      onChange={handleInputChange}
                      required
                      className="rounded-xl h-11 border-border/40 bg-background focus:ring-primary/20 font-semibold"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="business_type" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Activity Type *
                    </Label>
                    <Select
                      value={formData.business_type}
                      onValueChange={handleSelectChange("business_type")}
                    >
                      <SelectTrigger id="business_type" className="rounded-xl h-11 border-border/40 bg-background font-semibold w-full">
                        <SelectValue placeholder="Select activity type" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {BUSINESS_TYPES.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="sm:col-span-2 space-y-2">
                    <Label htmlFor="address" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Business Address *
                    </Label>
                    <Input
                      id="address"
                      name="address"
                      placeholder="Street address, building number, etc."
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      className="rounded-xl h-11 border-border/40 bg-background focus:ring-primary/20 font-semibold"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zone" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Zone / District *
                    </Label>
                    <Select
                      value={formData.zone}
                      onValueChange={handleSelectChange("zone")}
                    >
                      <SelectTrigger id="zone" className={`rounded-xl h-11 border-border/40 bg-background font-semibold w-full ${isZoneB ? "border-amber-500/50 bg-amber-500/5" : ""}`}>
                        <SelectValue placeholder="Select zone" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {ZONES.map(z => (
                          <SelectItem key={z.value} value={z.value}>{z.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {isZoneB && (
                      <p className="text-[10px] text-amber-600 font-bold flex items-center gap-1">
                        <AlertTriangle className="size-3" />
                        Zone B requires an Environmental Impact Audit document.
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="surface_area" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Surface Area (m²)
                    </Label>
                    <Input
                      id="surface_area"
                      name="surface_area"
                      type="number"
                      placeholder="e.g., 50"
                      value={formData.surface_area}
                      onChange={handleInputChange}
                      className="rounded-xl h-11 border-border/40 bg-background focus:ring-primary/20 font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="business_description" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Business Description
                  </Label>
                  <Textarea
                    id="business_description"
                    name="business_description"
                    rows={4}
                    placeholder="Describe the business activities, services offered, and number of employees..."
                    value={formData.business_description}
                    onChange={handleInputChange}
                    className="rounded-xl border-border/40 bg-background focus:ring-primary/20 resize-none leading-relaxed"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Applicant Information */}
            <Card className="rounded-2xl border-border/40 bg-card shadow-sm overflow-hidden">
              <CardHeader className="p-6 pb-2">
                <CardTitle className="text-xl font-bold">Applicant Information</CardTitle>
                <CardDescription className="text-sm">
                  Personal identifiers of the applicant responsible for this request.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="applicant_name" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Full Name *
                    </Label>
                    <Input
                      id="applicant_name"
                      name="applicant_name"
                      value={formData.applicant_name}
                      onChange={handleInputChange}
                      required
                      className="rounded-xl h-11 border-border/40 bg-background focus:ring-primary/20 font-semibold"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="applicant_cin" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      CIN / ID Number *
                    </Label>
                    <Input
                      id="applicant_cin"
                      name="applicant_cin"
                      placeholder="e.g., AB123456"
                      value={formData.applicant_cin}
                      onChange={handleInputChange}
                      required
                      className="rounded-xl h-11 border-border/40 bg-background focus:ring-primary/20 font-semibold"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - Documents & Submit */}
          <div className="lg:col-span-3 min-w-0 space-y-6">
            <Card className="w-full max-w-sm lg:ml-auto rounded-2xl border-border/40 bg-card shadow-sm overflow-hidden sticky top-6">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-lg font-bold flex min-w-0 flex-wrap items-center justify-between gap-2">
                  <span className="min-w-0">Required Documents</span>
                  <span className="text-[9px] flex shrink-0 items-center gap-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                    <Sparkles className="size-3" /> AI Verification
                  </span>
                </CardTitle>
                <CardDescription className="text-sm">
                  Upload official copies for compliance screening.
                </CardDescription>
                {/* Progress */}
                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Upload Progress</p>
                    <p className="text-[10px] font-black text-primary">{requiredUploaded}/{requiredCount} required</p>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: requiredCount > 0 ? `${(requiredUploaded / requiredCount) * 100}%` : "0%" }}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="grid min-w-0 gap-3">
                  {/* Required docs */}
                  {REQUIRED_DOCUMENTS.map(renderDocumentUpload)}

                  {/* Zone B conditional doc */}
                  {isZoneB && (
                    <div className="pt-2 border-t border-amber-500/20 space-y-2">
                      <div className="flex items-center gap-1.5">
                        <Leaf className="size-3 text-amber-500" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">
                          Zone B — Environmental Requirement
                        </p>
                      </div>
                      {renderDocumentUpload(ZONE_B_DOCUMENT)}
                    </div>
                  )}

                  {/* Optional docs */}
                  <div className="pt-2 border-t border-border/25 space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Optional Documents
                    </p>
                    {OPTIONAL_DOCUMENTS.map(renderDocumentUpload)}
                  </div>
                </div>

                <Separator className="my-4 bg-border/40" />

                {/* Summary */}
                {uploadedCount > 0 && (
                  <div className="space-y-1.5 pb-2">
                    {Object.entries(files).map(([key, f]) => (
                      <div key={key} className="flex items-center gap-2 text-[10px]">
                        <CheckCircle2 className="size-3 text-emerald-500 shrink-0" />
                        <span className="truncate text-muted-foreground">{f.name}</span>
                        <Badge
                          className={`text-[8px] px-1.5 py-0 shrink-0 ${f.approved === false ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"}`}
                        >
                          {f.approved === false ? "Flagged" : "OK"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl text-base font-bold bg-primary text-primary-foreground hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/10"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Submitting Request...
                    </>
                  ) : (
                    <>
                      <FileCheck className="size-5 mr-2" />
                      Submit Economic Request
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </main>
  );
}
