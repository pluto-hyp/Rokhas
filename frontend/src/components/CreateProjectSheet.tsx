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
    zone: "Zone Urbaine",
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
        toast.error("Veuillez télécharger TOUS les documents: Plans, Dossier Architecture, CIN, Propriété, et Mandat.");
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
      toast.success("Dossier soumis ! L'Agent IA vérifie actuellement la conformité des plans et documents.");
      onOpenChange(false);
      if (onSuccess) onSuccess();
      resetForm();
    } catch (error) {
      console.error("Failed to create project:", error);
      toast.error(error instanceof Error ? error.message : "Erreur lors de la soumission");
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
      zone: "Zone Urbaine",
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
        loading: 'Téléchargement...',
        success: () => {
          setFiles(prev => ({ ...prev, [key]: true }));
          return 'Document téléchargé !';
        },
        error: 'Erreur',
      }
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[600px] overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl font-serif">
            {role === "architect" ? "Soumission de Projet Urbain" : "Nouvelle Demande Économique"}
          </SheetTitle>
          <SheetDescription>
            {role === "architect" 
              ? "L'Agent IA vérifie la conformité technique des plans et la validité légale des procurations."
              : "Soumettez votre demande d'autorisation commerciale directement."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pb-20">
          {/* Core Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Titre du Projet
              </Label>
              <Input
                id="title"
                name="title"
                placeholder={role === "architect" ? "Construction d'une Villa à Rabat" : "Ouverture d'un Commerce - Casablanca"}
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
                    <UserIcon size={14} /> Nom du Propriétaire
                  </Label>
                  <Input
                    id="citizen_name"
                    name="citizen_name"
                    placeholder="Nom complet"
                    value={formData.citizen_name}
                    onChange={handleChange}
                    required
                    className="rounded-xl h-10 border-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="citizen_cin" className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <CreditCard size={14} /> N° CIN
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
                    <FileText size={14} /> Référence Foncière (Titre de Propriété)
                  </Label>
                  <Input
                    id="land_reference"
                    name="land_reference"
                    placeholder="Ex: 12345/R - Titre Foncier"
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
                Type de Demande
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
                      <SelectItem value="Building Permit">Permis de Construire</SelectItem>
                      <SelectItem value="Renovation">Autorisation de Rénovation</SelectItem>
                      <SelectItem value="Demolition">Permis de Démolir</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="Economic Authorization">Autorisation Économique</SelectItem>
                      <SelectItem value="Commercial License">Licence Commerciale</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="zone" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Zone d'Urbanisme
              </Label>
              <Select
                value={formData.zone}
                onValueChange={(value) => handleSelectChange("zone", value || "")}
              >
                <SelectTrigger id="zone" className="rounded-xl h-10 border-primary/20">
                  <SelectValue placeholder="Select zone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Zone Urbaine">Zone Urbaine (U)</SelectItem>
                  <SelectItem value="Zone Industrielle">Zone Industrielle (I)</SelectItem>
                  <SelectItem value="Zone Rurale">Zone Rurale (R)</SelectItem>
                  <SelectItem value="Zone Touristique">Zone Touristique (T)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Document Upload Section */}
          <div className="space-y-4">
            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              Documents Requis <span className="text-[10px] text-amber-600 border border-amber-600/30 px-1 rounded">Validation Agent IA</span>
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
                        <p className="font-bold">Procuration / Mandat</p>
                        <p className="text-xs text-muted-foreground">Preuve légale obligatoire</p>
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
                        <p className="font-bold">Plans de Construction</p>
                        <p className="text-xs text-muted-foreground text-amber-600 font-bold italic">REQUIS: Nom du citoyen sur le plan</p>
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
                        <p className="font-bold">Dossier Architecture</p>
                        <p className="text-xs text-muted-foreground">Notes techniques obligatoires</p>
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
                        <p className="text-xs font-bold">CIN du Citoyen</p>
                        <p className="text-[10px] text-muted-foreground text-amber-600">Vérifié par IA</p>
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
                        <p className="text-xs font-bold">Titre Foncier</p>
                        <p className="text-[10px] text-muted-foreground text-emerald-600">Preuve Propriété</p>
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
                      <p className="font-bold">Documents de l'Entreprise</p>
                      <p className="text-xs text-muted-foreground">RC, Statuts, IF, etc.</p>
                    </div>
                  </div>
                  {files.business ? <ShieldCheck className="text-emerald-500" /> : <UploadCloud size={20} className="text-muted-foreground" />}
                </div>
              )}
            </div>
          </div>

          <SheetFooter className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-border/40">
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold hover:scale-[1.02] transition-transform active:scale-[0.98] shadow-lg shadow-primary/20"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Soumission en cours...
                </>
              ) : (
                role === "architect" ? "Soumettre le Dossier d'Urbanisme" : "Soumettre la Demande Économique"
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
