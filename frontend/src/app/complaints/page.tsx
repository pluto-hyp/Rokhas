"use client";

import { useState } from "react";
import { 
  ArrowLeft, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  User, 
  FileText, 
  UploadCloud, 
  X,
  FileCheck,
  Building,
  ShieldAlert
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface Complaint {
  id: string;
  reference: string;
  category: string;
  title: string;
  description: string;
  status: "Pending" | "Investigating" | "Resolved";
  created_at: string;
  assigned_to?: string;
  dossier_ref?: string;
}

export default function ComplaintsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [complaints, setComplaints] = useState<Complaint[]>([
    {
      id: "CMP-0042",
      reference: "CMP-2026-0042",
      category: "Administrative Delay",
      title: "Inspection Delay on Construction Site A2",
      description: "We submitted the structural safety report 14 days ago, but the local municipal officer has not scheduled the inspection visit yet.",
      status: "Investigating",
      created_at: "2026-05-10",
      assigned_to: "Officer Kamal Alami",
      dossier_ref: "RKH-2026-0412"
    },
    {
      id: "CMP-0019",
      reference: "CMP-2026-0019",
      category: "Zoning Dispute",
      title: "Incorrect zone alignment for Commercial Plot 4",
      description: "The AI agent parsed the plot boundary in Zone C, but current master plans place it under commercial mixed-use Zone B.",
      status: "Resolved",
      created_at: "2026-04-28",
      assigned_to: "Director Sofia Benkirane",
      dossier_ref: "RKH-2026-0188"
    }
  ]);

  const [formData, setFormData] = useState({
    category: "",
    dossier_ref: "",
    title: "",
    description: ""
  });
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (value: string | null) => {
    setFormData(prev => ({ ...prev, category: value || "" }));
  };

  const handleFileUpload = () => {
    const mockFiles = ["site_blueprint_v2.pdf", "delay_notice_commune.jpg", "land_deed_conflict.pdf"];
    const randomFile = mockFiles[Math.floor(Math.random() * mockFiles.length)];
    if (uploadedFiles.includes(randomFile)) {
      toast.info("File already attached");
      return;
    }
    setUploadedFiles(prev => [...prev, randomFile]);
    toast.success(`Attached ${randomFile}`);
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category || !formData.title || !formData.description) {
      toast.error("Please fill in all mandatory fields");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const newComplaint: Complaint = {
        id: `CMP-0${Math.floor(100 + Math.random() * 900)}`,
        reference: `CMP-2026-0${Math.floor(1000 + Math.random() * 9000)}`,
        category: formData.category,
        title: formData.title,
        description: formData.description,
        status: "Pending",
        created_at: new Date().toISOString().split("T")[0],
        dossier_ref: formData.dossier_ref || undefined
      };

      setComplaints(prev => [newComplaint, ...prev]);
      setFormData({ category: "", dossier_ref: "", title: "", description: "" });
      setUploadedFiles([]);
      setLoading(false);
      toast.success("Grievance lodged successfully! Assigned to queue.");
    }, 1200);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Resolved":
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20">
            <CheckCircle2 className="size-3" /> Resolved
          </span>
        );
      case "Investigating":
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 animate-pulse">
            <Clock className="size-3" /> Investigating
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold text-blue-500 bg-blue-500/10 border border-blue-500/20">
            <AlertCircle className="size-3" /> Filed (Pending)
          </span>
        );
    }
  };

  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
      {/* Glow Effects */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      
      <section className="mx-auto max-w-7xl rounded-2xl border border-border bg-card px-6 py-8 shadow-sm sm:px-9 relative overflow-hidden">
        {/* Header Block */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
                <MessageSquare className="size-8 text-primary" />
                Complaints & Grievances
              </h1>
              <p className="text-base text-muted-foreground">
                Lodge formal administrative reports, appeal zoning decisions, and monitor active municipality investigations.
              </p>
            </div>
            <Link href="/dashboard">
              <Button variant="outline" className="h-11 gap-2 rounded-xl border-border/40 hover:bg-muted font-bold transition-all hover:scale-[1.02] active:scale-[0.98]">
                <ArrowLeft className="size-4" />
                Return to Dashboard
              </Button>
            </Link>
          </div>
        </div>

        <Separator className="mt-8" />

        <div className="grid gap-8 pt-8 lg:grid-cols-5">
          {/* Lodge Complaint Form */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="rounded-2xl border-border/40 bg-background/50 shadow-none overflow-hidden">
              <CardHeader className="p-6">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <ShieldAlert className="size-5 text-primary" />
                  File a New Grievance
                </CardTitle>
                <CardDescription>
                  Provide comprehensive information so our compliance co-pilot can assign it instantly to the correct municipal desk.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-5 p-6 pt-0">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Grievance Category *</Label>
                      <Select value={formData.category} onValueChange={handleSelectChange}>
                        <SelectTrigger className="h-11 w-full rounded-xl border-border/40 bg-background">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent align="start" className="rounded-xl">
                          <SelectItem value="Administrative Delay">Administrative Delay</SelectItem>
                          <SelectItem value="Zoning Dispute">Zoning Dispute</SelectItem>
                          <SelectItem value="Inspections & Officers">Inspections & Officers</SelectItem>
                          <SelectItem value="Construction Disturbance">Construction Disturbance</SelectItem>
                          <SelectItem value="Platform/Portal Issue">Platform/Portal Issue</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dossier_ref" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Associated Dossier Ref (Optional)</Label>
                      <Input 
                        id="dossier_ref" 
                        value={formData.dossier_ref}
                        onChange={handleInputChange}
                        placeholder="e.g. RKH-2026-0412" 
                        className="h-11 rounded-xl border-border/40 bg-background"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Grievance Title *</Label>
                    <Input 
                      id="title" 
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Summarize the core grievance" 
                      className="h-11 rounded-xl border-border/40 bg-background"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Detailed Description *</Label>
                    <Textarea 
                      id="description" 
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Please specify timelines, municipal officers involved, boundaries, and any details." 
                      rows={5}
                      className="rounded-xl border-border/40 bg-background resize-none leading-relaxed"
                      required
                    />
                  </div>

                  {/* Supporting Files Drag Drop */}
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Attach Supporting Evidence</Label>
                    <div 
                      onClick={handleFileUpload}
                      className="border-2 border-dashed border-border/60 rounded-2xl p-6 text-center cursor-pointer hover:bg-muted/10 hover:border-primary/40 transition-all flex flex-col items-center justify-center gap-2 group"
                    >
                      <UploadCloud className="size-8 text-muted-foreground group-hover:text-primary transition-colors" />
                      <p className="text-sm font-semibold">Click to upload files / documents</p>
                      <p className="text-xs text-muted-foreground">PDF, JPEG, or PNG up to 5MB. Fully parsed by AI audit gate.</p>
                    </div>

                    {/* Attached files list */}
                    {uploadedFiles.length > 0 && (
                      <div className="grid gap-2 pt-2 sm:grid-cols-2">
                        {uploadedFiles.map((filename, i) => (
                          <div key={i} className="flex items-center justify-between border border-border/40 bg-muted/20 p-2.5 rounded-xl text-xs font-medium">
                            <span className="truncate flex items-center gap-1.5">
                              <FileText className="size-3.5 text-primary shrink-0" />
                              {filename}
                            </span>
                            <button 
                              type="button" 
                              onClick={() => handleRemoveFile(i)}
                              className="size-5 rounded-full hover:bg-muted/80 flex items-center justify-center shrink-0 transition-colors"
                            >
                              <X className="size-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="p-6 border-t border-border/40 bg-muted/5 flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="h-12 min-w-[160px] rounded-xl text-base font-bold bg-primary text-primary-foreground hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <Send className="size-4" />
                    {loading ? "Filing Grievance..." : "File Complaint"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>

          {/* Active Grievances / Timeline History */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-lg font-bold flex items-center gap-2 px-1">
              <FileCheck className="size-5 text-primary" />
              Filed Complaints Queue ({complaints.length})
            </h3>
            
            <div className="space-y-4 overflow-y-auto max-h-[640px] pr-2">
              {complaints.map((comp) => (
                <Card key={comp.id} className="border-border/40 bg-background/50 hover:bg-background transition-colors rounded-2xl shadow-none overflow-hidden">
                  <CardHeader className="p-5 pb-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md">
                        {comp.reference}
                      </span>
                      {getStatusBadge(comp.status)}
                    </div>
                    <CardTitle className="text-base font-extrabold mt-3">{comp.title}</CardTitle>
                    <p className="text-xs font-semibold text-primary">{comp.category}</p>
                  </CardHeader>
                  <CardContent className="p-5 pt-0 pb-4 space-y-3">
                    <p className="text-xs text-muted-foreground leading-relaxed leading-relaxed">{comp.description}</p>
                    
                    <div className="bg-muted/10 border border-border/40 rounded-xl p-3 text-[11px] space-y-2">
                      {comp.dossier_ref && (
                        <p className="flex items-center gap-1.5 text-foreground/80">
                          <Building className="size-3.5 text-muted-foreground" />
                          <strong>Dossier Ref:</strong> {comp.dossier_ref}
                        </p>
                      )}
                      {comp.assigned_to && (
                        <p className="flex items-center gap-1.5 text-foreground/80">
                          <User className="size-3.5 text-muted-foreground" />
                          <strong>Assigned Agent:</strong> {comp.assigned_to}
                        </p>
                      )}
                      <p className="text-muted-foreground flex items-center gap-1">
                        <strong>Lodged On:</strong> {comp.created_at}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

      </section>
    </main>
  );
}
