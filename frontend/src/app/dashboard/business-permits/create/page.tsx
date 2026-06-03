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
  FileCheck
} from "lucide-react";

const BUSINESS_TYPES = [
  "Restaurant",
  "Café",
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

type RequiredDocument = {
  key: string;
  label: string;
  helper: string;
  required?: boolean;
  icon: React.ComponentType<{ size?: number; className?: string }>;
};

const REQUIRED_DOCUMENTS: RequiredDocument[] = [
  { key: "owner_id_card", label: "Copy of Owner ID Card (CIN)", helper: "National Identity Card", icon: CreditCard },
  { key: "commercial_register", label: "Commercial Register (RC)", helper: "Registre du Commerce", icon: Building2 },
  { key: "tax_patent", label: "Tax Patent (Patente / IF)", helper: "Identifiant Fiscal copy", icon: FileText },
  { key: "premises_lease", label: "Lease Agreement / Title Deed", helper: "Contrat de bail or ownership deed", icon: ShieldCheck },
];

const OPTIONAL_DOCUMENTS: RequiredDocument[] = [
  { key: "zoning_plan", label: "Location or Zoning Plan", helper: "Plan de situation (Optional)", required: false, icon: FileText },
];

export default function CreateBusinessPermitPage() {
  const router = useRouter();
  const { token, user: authUser } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [files, setFiles] = React.useState<{ [key: string]: { name: string; size: string; approved?: boolean; notes?: string[]; url?: string } }>({});
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string | null) => {
    if (!value) return;
    setFormData(prev => ({ ...prev, business_type: value }));
  };

  const triggerFileInput = (key: string) => {
    fileInputRefs.current[key]?.click();
  };

  const handleFileChange = (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    const sizeStr = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
      : `${(file.size / 1024).toFixed(0)} KB`;

    toast.promise(
      (async () => {
        // Upload file to backend
        const uploadResult = await uploadTemporaryDocument(file, token);
        
        // Store in local state with URL
        setFiles(prev => ({
          ...prev,
          [key]: {
            name: file.name,
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
          // Extract metadata from filename if available
          const cinMatch = file.name.match(/\b([A-Z]{1,2}\d{5,6})\b/i);
          if (cinMatch && !formData.applicant_cin) {
            setFormData(prev => ({ ...prev, applicant_cin: cinMatch[1].toUpperCase() }));
            toast.info(`Extracted CIN: ${cinMatch[1].toUpperCase()}`);
          }
          
          return `${file.name} uploaded successfully!`;
        },
        error: (err) => {
          return err instanceof Error ? err.message : "Upload failed";
        },
      }
    );

    // Also run AI analysis on the filename
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

    // Verify all required documents are uploaded
    const missingDocs = REQUIRED_DOCUMENTS.filter(doc => !files[doc.key]);
    if (missingDocs.length > 0) {
      toast.error(`Please upload all mandatory documents: ${missingDocs.map(d => d.label).join(", ")}`);
      return;
    }

    setLoading(true);

    try {
      toast.loading("Creating business permit request...", { id: "submit" });

      const permitDocuments: BusinessPermitDocument[] = [...REQUIRED_DOCUMENTS, ...OPTIONAL_DOCUMENTS]
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
      <div
        key={doc.key}
        onClick={() => triggerFileInput(doc.key)}
        className={`flex w-full min-w-0 items-center justify-between gap-2 p-3 rounded-xl border-2 border-dashed transition-all cursor-pointer ${uploadedFile ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-500" : "border-border/40 hover:border-primary/40 hover:bg-muted/30"}`}
      >
        <input
          type="file"
          ref={(el) => { fileInputRefs.current[doc.key] = el; }}
          className="hidden"
          onChange={(e) => handleFileChange(doc.key, e)}
        />
        <div className="flex min-w-0 flex-1 items-center gap-2 text-sm">
          <div className={`p-2 rounded-lg shrink-0 ${uploadedFile ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"}`}>
            <Icon size={16} />
          </div>
          <div className="text-left min-w-0">
            <p className="font-bold text-foreground text-xs truncate">
              {uploadedFile ? uploadedFile.name : doc.label}
            </p>
            <p className={`text-[10px] truncate ${doc.required === false ? "text-muted-foreground" : "text-amber-600 font-bold"}`}>
              {uploadedFile ? `${uploadedFile.size} • ${uploadedFile.approved === false ? "Flagged" : "Accepted"}` : doc.helper}
            </p>
          </div>
        </div>
        {uploadedFile ? <ShieldCheck className="size-5 text-emerald-500 shrink-0" /> : <UploadCloud size={18} className="text-muted-foreground shrink-0" />}
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8 max-w-5xl mx-auto w-full relative">
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
              New Business Permit Request
            </h1>
            <p className="text-base text-muted-foreground font-medium">
              Submit your economic authorization request directly to the administrative desk.
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
                  Specify name, type, and location details of the commercial entity.
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
                      Business Type *
                    </Label>
                    <Select
                      value={formData.business_type}
                      onValueChange={handleSelectChange}
                    >
                      <SelectTrigger id="business_type" className="rounded-xl h-11 border-border/40 bg-background font-semibold w-full">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {BUSINESS_TYPES.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Business Address *
                    </Label>
                    <Input
                      id="address"
                      name="address"
                      placeholder="Street address, building, etc."
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      className="rounded-xl h-11 border-border/40 bg-background focus:ring-primary/20 font-semibold"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zone" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Zone/District
                    </Label>
                    <Input
                      id="zone"
                      name="zone"
                      placeholder="e.g., Central Commercial Zone"
                      value={formData.zone}
                      onChange={handleInputChange}
                      className="rounded-xl h-11 border-border/40 bg-background focus:ring-primary/20 font-semibold"
                    />
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
                    placeholder="Describe your business activities and services..."
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
                  Personal identifiers representing the filing citizen.
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
                      CIN/ID Number *
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

          {/* Right Sidebar - Docs & Submit */}
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
                  Upload official copies of documents to initiate compliance screening.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="grid min-w-0 gap-3">
                  {REQUIRED_DOCUMENTS.map(renderDocumentUpload)}
                  
                  <div className="pt-2 space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Conditional Documents
                    </p>
                    {OPTIONAL_DOCUMENTS.map(renderDocumentUpload)}
                  </div>
                </div>

                <Separator className="my-4 bg-border/40" />

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
                      Submit Request
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
