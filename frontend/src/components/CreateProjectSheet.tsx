"use client";

import * as React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { createProject, ProjectCreate } from "@/lib/api";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, UploadCloud, FileText, UserIcon, Building2, ShieldCheck, CreditCard, Briefcase } from "lucide-react";

interface CreateProjectSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateProjectSheet({
  open,
  onOpenChange,
  onSuccess,
}: CreateProjectSheetProps) {
  const { token, user } = useAuth();
  const role = user?.role || "citizen";
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
    if (!token) return;

    // Strict validation for Architects: Legal, Technical, and Identity docs
    if (role === "architect") {
      const requiredFiles = ["plan", "arch", "prop", "cin", "agency"];
      const missingFiles = requiredFiles.filter(f => !files[f]);
      
      if (missingFiles.length > 0) {
        toast.error("Please upload ALL documents: Plans, Architecture Dossier, CIN, Property, and Proxy.");
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
      onOpenChange(false);
      if (onSuccess) onSuccess();
      resetForm();
    } catch (error) {
      console.error("Failed to create project:", error);
      toast.error(error instanceof Error ? error.message : "Error during submission");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
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
    setFiles({});
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
        loading: 'Uploading...',
        success: () => {
          setFiles(prev => ({ ...prev, [key]: true }));
          return 'Document uploaded!';
        },
        error: 'Error',
      }
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[600px] overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl font-serif">
            {role === "architect" ? "Urban Project Submission" : "New Economic Request"}
          </SheetTitle>
          <SheetDescription>
            {role === "architect" 
              ? "The AI Agent verifies technical plan compliance and legal proxy validity."
              : "Submit your commercial authorization request directly."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pb-20">
          {/* Core Info */}
          <div className="space-y-4">
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
                className="rounded-xl h-10 border-primary/20"
              />
            </div>

            {role === "architect" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="citizen_name" className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <UserIcon size={14} /> Owner Name
                  </Label>
                  <Input
                    id="citizen_name"
                    name="citizen_name"
                    placeholder="Full Name"
                    value={formData.citizen_name}
                    onChange={handleChange}
                    required
                    className="rounded-xl h-10 border-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="citizen_cin" className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <CreditCard size={14} /> CIN Number
                  </Label>
                  <Input
                    id="citizen_cin"
                    name="citizen_cin"
                    placeholder="Ex: AB123456"
                    value={formData.citizen_cin}
                    onChange={handleChange}
                    required
                    className="rounded-xl h-10 border-primary/20"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="land_reference" className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <FileText size={14} /> Land Reference (Title Deed)
                  </Label>
                  <Input
                    id="land_reference"
                    name="land_reference"
                    placeholder="Ex: 12345/R - Land Title"
                    value={formData.land_reference}
                    onChange={handleChange}
                    required
                    className="rounded-xl h-10 border-primary/20"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Project Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Request Type
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleSelectChange("type", value || "")}
              >
                <SelectTrigger id="type" className="rounded-xl h-10 border-primary/20">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
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
                <SelectTrigger id="zone" className="rounded-xl h-10 border-primary/20">
                  <SelectValue placeholder="Select zone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Urban Zone">Urban Zone (U)</SelectItem>
                  <SelectItem value="Industrial Zone">Industrial Zone (I)</SelectItem>
                  <SelectItem value="Rural Zone">Rural Zone (R)</SelectItem>
                  <SelectItem value="Tourist Zone">Tourist Zone (T)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Document Upload Section */}
          <div className="space-y-4">
            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              Required Documents <span className="text-[10px] text-amber-600 border border-amber-600/30 px-1 rounded">AI Agent Validation</span>
            </Label>
            <div className="grid gap-3">
              {role === "architect" ? (
                <>
                  <div 
                    onClick={() => simulateUpload("agency")}
                    className={`flex items-center justify-between p-3 rounded-xl border-2 border-dashed transition-all cursor-pointer ${files.agency ? "border-emerald-500/50 bg-emerald-50/50" : "border-border/40 hover:border-primary/40 hover:bg-muted/50"}`}
                  >
                    <div className="flex items-center gap-3 text-sm">
                      <div className={`p-2 rounded-lg ${files.agency ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"}`}>
                        <Briefcase size={18} />
                      </div>
                      <div>
                        <p className="font-bold">Proxy / Mandate</p>
                        <p className="text-xs text-muted-foreground">Mandatory legal proof</p>
                      </div>
                    </div>
                    {files.agency ? <ShieldCheck className="text-emerald-500" /> : <UploadCloud size={20} className="text-muted-foreground" />}
                  </div>

                  <div 
                    onClick={() => simulateUpload("plan")}
                    className={`flex items-center justify-between p-3 rounded-xl border-2 border-dashed transition-all cursor-pointer ${files.plan ? "border-emerald-500/50 bg-emerald-50/50" : "border-border/40 hover:border-primary/40 hover:bg-muted/50"}`}
                  >
                    <div className="flex items-center gap-3 text-sm">
                      <div className={`p-2 rounded-lg ${files.plan ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"}`}>
                        <Building2 size={18} />
                      </div>
                      <div>
                        <p className="font-bold">Construction Plans</p>
                        <p className="text-xs text-muted-foreground text-amber-600 font-bold italic">REQUIRED: Owner name on plan</p>
                      </div>
                    </div>
                    {files.plan ? <ShieldCheck className="text-emerald-500" /> : <UploadCloud size={20} className="text-muted-foreground" />}
                  </div>

                  <div 
                    onClick={() => simulateUpload("arch")}
                    className={`flex items-center justify-between p-3 rounded-xl border-2 border-dashed transition-all cursor-pointer ${files.arch ? "border-emerald-500/50 bg-emerald-50/50" : "border-border/40 hover:border-primary/40 hover:bg-muted/50"}`}
                  >
                    <div className="flex items-center gap-3 text-sm">
                      <div className={`p-2 rounded-lg ${files.arch ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"}`}>
                        <FileText size={18} />
                      </div>
                      <div>
                        <p className="font-bold">Architecture Dossier</p>
                        <p className="text-xs text-muted-foreground">Mandatory technical notes</p>
                      </div>
                    </div>
                    {files.arch ? <ShieldCheck className="text-emerald-500" /> : <UploadCloud size={20} className="text-muted-foreground" />}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div 
                      onClick={() => simulateUpload("cin")}
                      className={`flex flex-col gap-2 p-3 rounded-xl border-2 border-dashed transition-all cursor-pointer ${files.cin ? "border-emerald-500/50 bg-emerald-50/50" : "border-border/40 hover:border-primary/40 hover:bg-muted/50"}`}
                    >
                      <div className="flex items-center justify-between">
                        <CreditCard size={18} className={files.cin ? "text-emerald-500" : "text-muted-foreground"} />
                        {files.cin && <ShieldCheck size={14} className="text-emerald-500" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold">Owner CIN</p>
                        <p className="text-[10px] text-muted-foreground text-amber-600">AI Verified</p>
                      </div>
                    </div>

                    <div 
                      onClick={() => simulateUpload("prop")}
                      className={`flex flex-col gap-2 p-3 rounded-xl border-2 border-dashed transition-all cursor-pointer ${files.prop ? "border-emerald-500/50 bg-emerald-50/50" : "border-border/40 hover:border-primary/40 hover:bg-muted/50"}`}
                    >
                      <div className="flex items-center justify-between">
                        <FileText size={18} className={files.prop ? "text-emerald-500" : "text-muted-foreground"} />
                        {files.prop && <ShieldCheck size={14} className="text-emerald-500" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold">Land Title</p>
                        <p className="text-[10px] text-muted-foreground text-emerald-600">Property Proof</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div 
                  onClick={() => simulateUpload("business")}
                  className={`flex items-center justify-between p-3 rounded-xl border-2 border-dashed transition-all cursor-pointer ${files.business ? "border-emerald-500/50 bg-emerald-50/50" : "border-border/40 hover:border-primary/40 hover:bg-muted/50"}`}
                >
                  <div className="flex items-center gap-3 text-sm">
                    <div className={`p-2 rounded-lg ${files.business ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"}`}>
                      <Building2 size={18} />
                    </div>
                    <div>
                      <p className="font-bold">Business Documents</p>
                      <p className="text-xs text-muted-foreground">RC, Articles, IF, etc.</p>
                    </div>
                  </div>
                  {files.business ? <ShieldCheck className="text-emerald-500" /> : <UploadCloud size={20} className="text-muted-foreground" />}
                </div>
              )}
            </div>
          </div>

          <SheetFooter className="absolute bottom-0 left-0 right-0 p-6 bg-card border-t border-border/40">
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold hover:scale-[1.02] transition-transform active:scale-[0.98] shadow-lg shadow-primary/20"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                role === "architect" ? "Submit Urban Dossier" : "Submit Economic Request"
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
