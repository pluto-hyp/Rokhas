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
import { Loader2, UploadCloud, FileText, UserIcon, Building2 } from "lucide-react";

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
  const [formData, setFormData] = React.useState<ProjectCreate & { citizen_name?: string }>({
    title: "",
    description: "",
    type: role === "architect" ? "Building Permit" : "Economic Authorization",
    hauteur: 0,
    recul: 0,
    emprise: 0,
    surface_terrain: 0,
    zone: "Zone Urbaine",
    citizen_name: "",
  });

  const [files, setFiles] = React.useState<{ [key: string]: boolean }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    // Simulation of file validation
    if (role === "architect" && (!files.plan || !files.arch || !files.prop)) {
      toast.error("Veuillez télécharger tous les documents obligatoires (Plans, Architecture, Propriété).");
      return;
    }

    setLoading(true);
    try {
      // Append citizen name to description for now as our API doesn't have a specific field
      const finalData = {
        ...formData,
        description: role === "architect" 
          ? `[CITIZEN: ${formData.citizen_name}] ${formData.description}` 
          : formData.description
      };
      
      await createProject(finalData, token);
      toast.success("Dossier soumis avec succès !");
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
      <SheetContent className="sm:max-w-[550px] overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl font-serif">
            {role === "architect" ? "Soumission de Projet Urbain" : "Nouvelle Demande Économique"}
          </SheetTitle>
          <SheetDescription>
            {role === "architect" 
              ? "En tant qu'architecte, vous soumettez ce projet au nom d'un citoyen. Tous les documents d'urbanisme sont requis."
              : "Soumettez votre demande d'autorisation commerciale ou économique directement."}
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
              <div className="space-y-2">
                <Label htmlFor="citizen_name" className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <UserIcon size={14} /> Identité du Bénéficiaire (Citoyen)
                </Label>
                <Input
                  id="citizen_name"
                  name="citizen_name"
                  placeholder="Nom complet du citoyen propriétaire"
                  value={formData.citizen_name}
                  onChange={handleChange}
                  required
                  className="rounded-xl h-10 border-primary/20"
                />
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
                onValueChange={(value) => handleSelectChange("type", value)}
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
                onValueChange={(value) => handleSelectChange("zone", value)}
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

          <div className="space-y-2">
            <Label htmlFor="description" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Description / Notes
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Précisions sur le projet..."
              value={formData.description}
              onChange={handleChange}
              className="rounded-xl min-h-[80px] resize-none border-primary/20"
            />
          </div>

          {/* Document Upload Section */}
          <div className="space-y-4">
            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Documents Requis
            </Label>
            <div className="grid gap-3">
              {role === "architect" ? (
                <>
                  <div 
                    onClick={() => simulateUpload("plan")}
                    className={`flex items-center justify-between p-3 rounded-xl border-2 border-dashed transition-all cursor-pointer ${files.plan ? "border-emerald-500/50 bg-emerald-50/50" : "border-border/40 hover:border-primary/40 hover:bg-muted/50"}`}
                  >
                    <div className="flex items-center gap-3 text-sm">
                      <div className={`p-2 rounded-lg ${files.plan ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"}`}>
                        <Building2 size={18} />
                      </div>
                      <div>
                        <p className="font-bold">Plan de Construction</p>
                        <p className="text-xs text-muted-foreground">Plans d'architecte détaillés (PDF/DWG)</p>
                      </div>
                    </div>
                    {files.plan ? <FileText className="text-emerald-500" /> : <UploadCloud size={20} className="text-muted-foreground" />}
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
                        <p className="font-bold">Dossier Architectural</p>
                        <p className="text-xs text-muted-foreground">Documents techniques et calculs</p>
                      </div>
                    </div>
                    {files.arch ? <FileText className="text-emerald-500" /> : <UploadCloud size={20} className="text-muted-foreground" />}
                  </div>

                  <div 
                    onClick={() => simulateUpload("prop")}
                    className={`flex items-center justify-between p-3 rounded-xl border-2 border-dashed transition-all cursor-pointer ${files.prop ? "border-emerald-500/50 bg-emerald-50/50" : "border-border/40 hover:border-primary/40 hover:bg-muted/50"}`}
                  >
                    <div className="flex items-center gap-3 text-sm">
                      <div className={`p-2 rounded-lg ${files.prop ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"}`}>
                        <UserIcon size={18} />
                      </div>
                      <div>
                        <p className="font-bold">Preuve de Propriété</p>
                        <p className="text-xs text-muted-foreground">Titre foncier du citoyen</p>
                      </div>
                    </div>
                    {files.prop ? <FileText className="text-emerald-500" /> : <UploadCloud size={20} className="text-muted-foreground" />}
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
                  {files.business ? <FileText className="text-emerald-500" /> : <UploadCloud size={20} className="text-muted-foreground" />}
                </div>
              )}
            </div>
          </div>

          {/* Technical Specs (Always shown but prioritized for Architect) */}
          <div className="bg-muted/30 p-4 rounded-2xl border border-border/40 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-tighter text-primary flex items-center gap-2">
              Spécifications d'Urbanisme
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hauteur" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Hauteur Max (m)
                </Label>
                <Input
                  id="hauteur"
                  name="hauteur"
                  type="number"
                  step="0.1"
                  value={formData.hauteur}
                  onChange={handleChange}
                  className="rounded-lg h-9 bg-white border-primary/10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recul" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Recul (m)
                </Label>
                <Input
                  id="recul"
                  name="recul"
                  type="number"
                  step="0.1"
                  value={formData.recul}
                  onChange={handleChange}
                  className="rounded-lg h-9 bg-white border-primary/10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emprise" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Emprise au sol (%)
                </Label>
                <Input
                  id="emprise"
                  name="emprise"
                  type="number"
                  value={formData.emprise}
                  onChange={handleChange}
                  className="rounded-lg h-9 bg-white border-primary/10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="surface_terrain" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Surface Terrain (m²)
                </Label>
                <Input
                  id="surface_terrain"
                  name="surface_terrain"
                  type="number"
                  value={formData.surface_terrain}
                  onChange={handleChange}
                  className="rounded-lg h-9 bg-white border-primary/10"
                />
              </div>
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
