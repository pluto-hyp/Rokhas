"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { createProject, ProjectCreate } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
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
  UserIcon, 
  Building2, 
  ShieldCheck, 
  CreditCard, 
  Briefcase, 
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Lock,
  Receipt
} from "lucide-react";

export default function CreateProjectPage() {
  const { token, user } = useAuth();
  const role = user?.role || "citizen";
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  
  const [formData, setFormData] = React.useState<ProjectCreate & { citizen_name?: string; citizen_cin?: string; land_reference?: string }>({
    title: "",
    description: "",
    type: role === "architect" ? "Building Permit" : "Economic Authorization",
    hauteur: 0,
    recul: 0,
    emprise: 0,
    surface_terrain: 0,
    zone: "Urban Zone",
    citizen_name: "",
    citizen_cin: "",
    land_reference: "",
  });

  const [files, setFiles] = React.useState<{ [key: string]: boolean }>({});
  
  // Architect payment simulation states
  const [isPaid, setIsPaid] = React.useState(false);
  const [payingFee, setPayingFee] = React.useState(false);
  const [receiptId, setReceiptId] = React.useState("");

  // Calculate simulated Moroccan Planning Tax fee
  const calculatedFee = React.useMemo(() => {
    const terrain = formData.surface_terrain || 0;
    return terrain > 0 ? Math.floor(terrain * 120 + 4500) : 4500;
  }, [formData.surface_terrain]);

  const handleSimulatePayment = () => {
    if (formData.surface_terrain <= 0) {
      toast.error("Please enter a valid Surface Terrain (m²) to calculate municipal taxes first.");
      return;
    }
    setPayingFee(true);
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: 'Connecting to Moroccan CMI Secure Gate...',
        success: () => {
          setIsPaid(true);
          const generatedRef = `REC-2026-MA-${Math.floor(100000 + Math.random() * 900000)}`;
          setReceiptId(generatedRef);
          setPayingFee(false);
          return 'Municipal Permit Tax Settled! Cryptographic Receipt attached.';
        },
        error: () => {
          setPayingFee(false);
          return 'CMI gateway timeout';
        }
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("You must be authenticated to submit a dossier.");
      return;
    }

    // Strict validation for Architects
    if (role === "architect") {
      const requiredFiles = ["plan", "arch", "prop", "cin", "agency"];
      const missingFiles = requiredFiles.filter(f => !files[f]);
      
      if (missingFiles.length > 0) {
        toast.error("Please upload ALL documents: Plans, Architecture Dossier, CIN, Property, and Proxy.");
        return;
      }

      if (!isPaid) {
        toast.error("COMMUNE PAYMENT REQUIRED: Please settle municipal permit tax fees at the bottom of the form before submitting.");
        return;
      }
    } else {
      if (!files.business) {
        toast.error("Please upload your Business Documents.");
        return;
      }
    }

    setLoading(true);
    try {
      // Append the official transaction bill and receipt reference into project description
      const finalData = {
        ...formData,
        description: role === "architect" 
          ? `[REF: ${formData.land_reference}] [CITIZEN: ${formData.citizen_name}] [CIN: ${formData.citizen_cin}] [COMMUNE FEE PAID: ${calculatedFee} DH] [RECEIPT: ${receiptId}] ${formData.description}` 
          : formData.description
      };
      
      await createProject(finalData, token);
      toast.success("Dossier submitted! Transaction bill linked. AI and municipal desks will verify the file.");
      router.push("/dashboard/projects");
    } catch (error) {
      console.error("Failed to create project:", error);
      toast.error(error instanceof Error ? error.message : "Error during submission");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const simulateUpload = (key: string) => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1000)),
      {
        loading: 'Uploading document securely...',
        success: () => {
          setFiles(prev => ({ ...prev, [key]: true }));
          return 'Document uploaded and pre-verified!';
        },
        error: 'Upload failed',
      }
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
              {role === "architect" ? "Urban Project Submission" : "New Economic Request"}
            </h1>
            <p className="text-base text-muted-foreground font-medium">
              {role === "architect" 
                ? "Moroccan administrative desk: simulated planning tax payment and validation flow."
                : "Submit your commercial authorization request directly to the administrative desk."}
            </p>
          </div>
          <Link href="/dashboard/projects">
            <Button variant="outline" className="h-11 gap-2 rounded-xl border-border/40 hover:bg-muted font-bold transition-all hover:scale-[1.02] active:scale-[0.98]">
              <ArrowLeft className="size-4" />
              Back to Dossiers
            </Button>
          </Link>
        </div>

        <Separator className="mt-2" />

        <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-3 pt-4">
          
          {/* Main Form Fields */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="rounded-2xl border-border/40 bg-card shadow-sm overflow-hidden">
              <CardHeader className="p-6 pb-2">
                <CardTitle className="text-xl font-bold">General Information</CardTitle>
                <CardDescription className="text-sm">
                  Specify core identifiers and descriptive context for your application.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Project Title
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder={role === "architect" ? "Villa Construction in Rabat" : "Business Opening - Casablanca"}
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="rounded-xl h-11 border-border/40 bg-background focus:ring-primary/20 font-semibold"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Detailed Description
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    rows={4}
                    placeholder="Provide relevant context, architectural notes..."
                    value={formData.description}
                    onChange={handleChange}
                    className="rounded-xl border-border/40 bg-background focus:ring-primary/20 resize-none leading-relaxed"
                  />
                </div>
              </CardContent>
            </Card>

            {role === "architect" && (
              <>
                {/* Legal & Ownership */}
                <Card className="rounded-2xl border-border/40 bg-card shadow-sm overflow-hidden">
                  <CardHeader className="p-6 pb-2">
                    <CardTitle className="text-xl font-bold">Legal & Ownership Identifiers</CardTitle>
                    <CardDescription className="text-sm">
                      Details must match the official Moroccan national records.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="citizen_name" className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                          <UserIcon size={14} /> Owner Full Name (Citizen)
                        </Label>
                        <Input
                          id="citizen_name"
                          name="citizen_name"
                          placeholder="Mohamed Alami"
                          value={formData.citizen_name}
                          onChange={handleChange}
                          required
                          className="rounded-xl h-11 border-border/40 bg-background focus:ring-primary/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="citizen_cin" className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                          <CreditCard size={14} /> Owner CIN Number
                        </Label>
                        <Input
                          id="citizen_cin"
                          name="citizen_cin"
                          placeholder="AB123456"
                          value={formData.citizen_cin}
                          onChange={handleChange}
                          required
                          className="rounded-xl h-11 border-border/40 bg-background focus:ring-primary/20"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="land_reference" className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <FileText size={14} /> Land Reference (Titre Foncier Number)
                      </Label>
                      <Input
                        id="land_reference"
                        name="land_reference"
                        placeholder="Ex: 54932/45 - Conservation Foncière"
                        value={formData.land_reference}
                        onChange={handleChange}
                        required
                        className="rounded-xl h-11 border-border/40 bg-background focus:ring-primary/20"
                      />
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            <Card className="rounded-2xl border-border/40 bg-card shadow-sm overflow-hidden">
              <CardHeader className="p-6 pb-2">
                <CardTitle className="text-xl font-bold">Dossier Classification & Terrain</CardTitle>
                <CardDescription className="text-sm">
                  Specify physical zoning attributes used for municipal permit fee assessments.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Request Type
                    </Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => handleSelectChange("type", value || "")}
                    >
                      <SelectTrigger id="type" className="rounded-xl h-11 border-border/40 bg-background font-semibold">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {role === "architect" ? (
                          <>
                            <SelectItem value="Building Permit">Building Permit</SelectItem>
                            <SelectItem value="Renovation">Renovation Authorization</SelectItem>
                            <SelectItem value="Demolition">Demolition Permit</SelectItem>
                          </>
                        ) : (
                          <>
                            <SelectItem value="Economic Authorization">Economic Authorization</SelectItem>
                            <SelectItem value="Commercial License">Commercial License</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="surface_terrain" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Surface Terrain (m²)
                    </Label>
                    <Input
                      id="surface_terrain"
                      name="surface_terrain"
                      type="number"
                      placeholder="e.g. 150"
                      value={formData.surface_terrain || ""}
                      onChange={handleChange}
                      required
                      className="rounded-xl h-11 border-border/40 bg-background focus:ring-primary/20 font-semibold"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* MANDATORY ARCHITECT PAYMENTS BLOCK (Dirham simulation) */}
            {role === "architect" && (
              <Card className="rounded-2xl border-border/40 bg-card shadow-sm overflow-hidden border-primary/20 relative">
                <CardHeader className="p-6 pb-2">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <CreditCard className="size-5 text-primary" />
                    Simulated Municipal Permit Tax (MAD)
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    In Moroccan central communes, planning fees are automatically settled by the filing architect before validation by municipal desks.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-muted/10 rounded-2xl border border-border/40">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Calculated Planning Tax Fee</p>
                      <p className="text-2xl font-black text-foreground mt-1">
                        {calculatedFee.toLocaleString()} DH
                      </p>
                      <p className="text-[9px] text-muted-foreground mt-0.5">Calculated: 4,500 DH base + 120 DH/m²</p>
                    </div>

                    {isPaid ? (
                      <span className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 self-start sm:self-auto">
                        <CheckCircle2 className="size-4" /> Paid & Settled
                      </span>
                    ) : (
                      <Button
                        type="button"
                        onClick={handleSimulatePayment}
                        disabled={payingFee || formData.surface_terrain <= 0}
                        className="h-11 rounded-xl bg-primary text-primary-foreground font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shrink-0 self-start sm:self-auto shadow-md shadow-primary/10"
                      >
                        {payingFee ? "Connecting CMI..." : "Pay via CMI Gate"}
                      </Button>
                    )}
                  </div>

                  {isPaid && receiptId && (
                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl space-y-3">
                      <p className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                        <ShieldCheck className="size-4" /> Transaction Bill Attached to Dossier File
                      </p>
                      <div className="grid grid-cols-2 gap-4 text-[10px] text-muted-foreground">
                        <div>
                          <strong>Grievance Vault Ref:</strong>
                          <p className="text-foreground font-semibold mt-0.5">{receiptId}</p>
                        </div>
                        <div>
                          <strong>Settlement Account:</strong>
                          <p className="text-foreground font-semibold mt-0.5">Trésorerie Générale du Royaume</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Sidebar - Docs & Submit */}
          <div className="space-y-6">
            <Card className="rounded-2xl border-border/40 bg-card shadow-sm overflow-hidden sticky top-6">
              <CardHeader className="p-6 pb-2">
                <CardTitle className="text-xl font-bold flex items-center justify-between">
                  Required Documents
                  <span className="text-[10px] flex items-center gap-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                    <Sparkles className="size-3" /> AI Verification
                  </span>
                </CardTitle>
                <CardDescription className="text-sm">
                  Upload files to start instant compliance checks.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid gap-3">
                  {role === "architect" ? (
                    <>
                      <div 
                        onClick={() => simulateUpload("agency")}
                        className={`flex items-center justify-between p-3.5 rounded-xl border-2 border-dashed transition-all cursor-pointer ${files.agency ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-500" : "border-border/40 hover:border-primary/40 hover:bg-muted/30"}`}
                      >
                        <div className="flex items-center gap-3 text-sm">
                          <div className={`p-2 rounded-lg ${files.agency ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"}`}>
                            <Briefcase size={18} />
                          </div>
                          <div className="text-left">
                            <p className="font-bold text-foreground text-xs">Proxy / Mandate</p>
                            <p className="text-[10px] text-muted-foreground">Mandatory legal proof</p>
                          </div>
                        </div>
                        {files.agency ? <ShieldCheck className="text-emerald-500 shrink-0" /> : <UploadCloud size={20} className="text-muted-foreground shrink-0" />}
                      </div>

                      <div 
                        onClick={() => simulateUpload("plan")}
                        className={`flex items-center justify-between p-3.5 rounded-xl border-2 border-dashed transition-all cursor-pointer ${files.plan ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-500" : "border-border/40 hover:border-primary/40 hover:bg-muted/30"}`}
                      >
                        <div className="flex items-center gap-3 text-sm">
                          <div className={`p-2 rounded-lg ${files.plan ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"}`}>
                            <Building2 size={18} />
                          </div>
                          <div className="text-left">
                            <p className="font-bold text-foreground text-xs">Construction Plans</p>
                            <p className="text-[10px] text-amber-600 font-bold">Owner name check</p>
                          </div>
                        </div>
                        {files.plan ? <ShieldCheck className="text-emerald-500 shrink-0" /> : <UploadCloud size={20} className="text-muted-foreground shrink-0" />}
                      </div>

                      <div 
                        onClick={() => simulateUpload("arch")}
                        className={`flex items-center justify-between p-3.5 rounded-xl border-2 border-dashed transition-all cursor-pointer ${files.arch ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-500" : "border-border/40 hover:border-primary/40 hover:bg-muted/30"}`}
                      >
                        <div className="flex items-center gap-3 text-sm">
                          <div className={`p-2 rounded-lg ${files.arch ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"}`}>
                            <FileText size={18} />
                          </div>
                          <div className="text-left">
                            <p className="font-bold text-foreground text-xs">Architecture Dossier</p>
                            <p className="text-[10px] text-muted-foreground">Technical sheets</p>
                          </div>
                        </div>
                        {files.arch ? <ShieldCheck className="text-emerald-500 shrink-0" /> : <UploadCloud size={20} className="text-muted-foreground shrink-0" />}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div 
                          onClick={() => simulateUpload("cin")}
                          className={`flex flex-col gap-2 p-3 rounded-xl border-2 border-dashed transition-all cursor-pointer ${files.cin ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-500" : "border-border/40 hover:border-primary/40 hover:bg-muted/30"}`}
                        >
                          <div className="flex items-center justify-between">
                            <CreditCard size={18} className={files.cin ? "text-emerald-500" : "text-muted-foreground"} />
                            {files.cin && <ShieldCheck size={14} className="text-emerald-500" />}
                          </div>
                          <div className="text-left">
                            <p className="text-xs font-bold text-foreground">Owner CIN</p>
                            <p className="text-[10px] text-amber-600 font-medium">AI Checked</p>
                          </div>
                        </div>

                        <div 
                          onClick={() => simulateUpload("prop")}
                          className={`flex flex-col gap-2 p-3 rounded-xl border-2 border-dashed transition-all cursor-pointer ${files.prop ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-500" : "border-border/40 hover:border-primary/40 hover:bg-muted/30"}`}
                        >
                          <div className="flex items-center justify-between">
                            <FileText size={18} className={files.prop ? "text-emerald-500" : "text-muted-foreground"} />
                            {files.prop && <ShieldCheck size={14} className="text-emerald-500" />}
                          </div>
                          <div className="text-left">
                            <p className="text-xs font-bold text-foreground">Land Title</p>
                            <p className="text-[10px] text-emerald-600 font-medium">Property</p>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div 
                      onClick={() => simulateUpload("business")}
                      className={`flex items-center justify-between p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer ${files.business ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-500" : "border-border/40 hover:border-primary/40 hover:bg-muted/30"}`}
                    >
                      <div className="flex items-center gap-3 text-sm">
                        <div className={`p-2.5 rounded-xl ${files.business ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"}`}>
                          <Building2 size={20} />
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-foreground text-xs">Business Documents</p>
                          <p className="text-[10px] text-muted-foreground">Upload RC or IF</p>
                        </div>
                      </div>
                      {files.business ? <ShieldCheck className="text-emerald-500 shrink-0" /> : <UploadCloud size={20} className="text-muted-foreground shrink-0" />}
                    </div>
                  )}
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
                      Submitting Dossier...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="size-5 mr-2" />
                      {role === "architect" ? "Submit Dossier" : "Submit Request"}
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
