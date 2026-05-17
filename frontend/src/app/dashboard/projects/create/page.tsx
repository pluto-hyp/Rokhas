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
  CheckCircle2
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("You must be authenticated to submit a dossier.");
      return;
    }

    // Strict validation for Architects: Legal, Technical, and Identity docs
    if (role === "architect") {
      const requiredFiles = ["plan", "arch", "prop", "cin", "agency"];
      const missingFiles = requiredFiles.filter(f => !files[f]);
      
      if (missingFiles.length > 0) {
        toast.error("Please upload ALL documents: Plans, Architecture Dossier, CIN, Property, and Proxy.");
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
      const finalData = {
        ...formData,
        description: role === "architect" 
          ? `[REF: ${formData.land_reference}] [CITIZEN: ${formData.citizen_name}] [CIN: ${formData.citizen_cin}] ${formData.description}` 
          : formData.description
      };
      
      await createProject(finalData, token);
      toast.success("Dossier submitted! The AI Agent is currently verifying plan compliance and document validity.");
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
    <main className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
      <div className="flex flex-col gap-6">
        {/* Header with back button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              {role === "architect" ? "Urban Project Submission" : "New Economic Request"}
            </h1>
            <p className="text-base text-muted-foreground">
              {role === "architect" 
                ? "The AI Agent automatically verifies technical plan compliance and legal proxy validity."
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
          {/* Main Info Section */}
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
                    className="rounded-xl h-11 border-border/40 bg-background focus:ring-primary/20"
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
                    placeholder="Provide relevant context, objectives, or extra notes..."
                    value={formData.description}
                    onChange={handleChange}
                    className="rounded-xl border-border/40 bg-background focus:ring-primary/20 resize-none"
                  />
                </div>
              </CardContent>
            </Card>

            {role === "architect" && (
              <Card className="rounded-2xl border-border/40 bg-card shadow-sm overflow-hidden">
                <CardHeader className="p-6 pb-2">
                  <CardTitle className="text-xl font-bold font-serif">Legal & Ownership Identifiers</CardTitle>
                  <CardDescription className="text-sm">
                    Enter details exactly as verified on official identity documents and title deeds.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="citizen_name" className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <UserIcon size={14} /> Owner Full Name
                      </Label>
                      <Input
                        id="citizen_name"
                        name="citizen_name"
                        placeholder="Ex: Mohamed Alami"
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
                        placeholder="Ex: AB123456"
                        value={formData.citizen_cin}
                        onChange={handleChange}
                        required
                        className="rounded-xl h-11 border-border/40 bg-background focus:ring-primary/20"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="land_reference" className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <FileText size={14} /> Land Reference (Title Deed Number)
                    </Label>
                    <Input
                      id="land_reference"
                      name="land_reference"
                      placeholder="Ex: 12345/R - Title Registry"
                      value={formData.land_reference}
                      onChange={handleChange}
                      required
                      className="rounded-xl h-11 border-border/40 bg-background focus:ring-primary/20"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="rounded-2xl border-border/40 bg-card shadow-sm overflow-hidden">
              <CardHeader className="p-6 pb-2">
                <CardTitle className="text-xl font-bold">Dossier Classification</CardTitle>
                <CardDescription className="text-sm">
                  Select the appropriate administrative type and zoning details.
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
                      <SelectTrigger id="type" className="rounded-xl h-11 border-border/40 bg-background">
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
                    <Label htmlFor="zone" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Urban Planning Zone
                    </Label>
                    <Select
                      value={formData.zone}
                      onValueChange={(value) => handleSelectChange("zone", value || "")}
                    >
                      <SelectTrigger id="zone" className="rounded-xl h-11 border-border/40 bg-background">
                        <SelectValue placeholder="Select zone" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="Urban Zone">Urban Zone (U)</SelectItem>
                        <SelectItem value="Industrial Zone">Industrial Zone (I)</SelectItem>
                        <SelectItem value="Rural Zone">Rural Zone (R)</SelectItem>
                        <SelectItem value="Tourist Zone">Tourist Zone (T)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - Required Documents & Action */}
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
                  Upload files to start instant automated regulation compliance checks.
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
                            <p className="font-bold text-foreground">Proxy / Mandate</p>
                            <p className="text-xs text-muted-foreground">Mandatory legal proof</p>
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
                            <p className="font-bold text-foreground">Construction Plans</p>
                            <p className="text-xs text-amber-600 font-bold">Owner name required on plan</p>
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
                            <p className="font-bold text-foreground">Architecture Dossier</p>
                            <p className="text-xs text-muted-foreground">Technical specifications</p>
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
                            <p className="text-[10px] text-amber-600 font-medium">AI Verified</p>
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
                            <p className="text-[10px] text-emerald-600 font-medium">Property Proof</p>
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
                          <p className="font-bold text-foreground">Business Documents</p>
                          <p className="text-xs text-muted-foreground">Upload RC, Articles, or IF</p>
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
