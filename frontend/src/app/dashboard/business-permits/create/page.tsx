"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ArrowLeft, Upload, FileText } from "lucide-react";
import Link from "next/link";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");

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

export default function CreateBusinessPermitPage() {
  const router = useRouter();
  const { token, user: authUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  
  const [formData, setFormData] = useState({
    business_name: "",
    business_type: "",
    business_description: "",
    address: "",
    zone: "",
    surface_area: "",
    applicant_name: authUser?.full_name || "",
    applicant_cin: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.business_name || !formData.business_type || !formData.address || !formData.applicant_cin) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      toast.loading("Creating business permit request...", { id: "submit" });

      // Create the permit
      const permitResponse = await fetch(`${API_URL}/api/v1/business-permits/`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...formData,
          surface_area: formData.surface_area ? parseInt(formData.surface_area) : null
        })
      });

      if (!permitResponse.ok) {
        throw new Error("Failed to create permit");
      }

      const permit = await permitResponse.json();

      // Upload documents
      if (files.length > 0) {
        const uploadPromises = files.map(file => {
          const formDataUpload = new FormData();
          formDataUpload.append("file", file);
          
          return fetch(`${API_URL}/api/v1/business-permits/${permit.id}/upload-document`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` },
            body: formDataUpload
          });
        });

        const uploadResults = await Promise.all(uploadPromises);
        const failedUploads = uploadResults.filter(r => !r.ok);
        
        if (failedUploads.length > 0) {
          toast.warning(`${failedUploads.length} file(s) failed to upload`, { id: "submit" });
        }
      }

      toast.success("Business permit request submitted successfully!", { id: "submit" });
      router.push(`/dashboard/business-permits/${permit.id}`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to submit permit";
      toast.error(errorMsg, { id: "submit" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 px-4 py-4">
      {/* Back Button */}
      <Link href="/dashboard/business-permits">
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Business Permits
        </Button>
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Submit Business Permit Request</h1>
        <p className="text-muted-foreground mt-1">Provide your business details and upload required documents.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6">
        {/* Business Information */}
        <Card className="border-border/40 shadow-none">
          <CardHeader>
            <CardTitle className="text-lg">Business Information</CardTitle>
            <CardDescription>Details about your business</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="business_name" className="font-bold">Business Name *</Label>
                <Input
                  id="business_name"
                  name="business_name"
                  placeholder="e.g., Al-Baraka Restaurant"
                  value={formData.business_name}
                  onChange={handleInputChange}
                  required
                  className="rounded-lg border-border/40"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="business_type" className="font-bold">Business Type *</Label>
                <select
                  id="business_type"
                  name="business_type"
                  value={formData.business_type}
                  onChange={handleInputChange}
                  required
                  className="flex h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select a business type...</option>
                  {BUSINESS_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="font-bold">Business Address *</Label>
                <Input
                  id="address"
                  name="address"
                  placeholder="Street address, building, etc."
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  className="rounded-lg border-border/40"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="zone" className="font-bold">Zone/District</Label>
                <Input
                  id="zone"
                  name="zone"
                  placeholder="e.g., Central Commercial Zone"
                  value={formData.zone}
                  onChange={handleInputChange}
                  className="rounded-lg border-border/40"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="surface_area" className="font-bold">Surface Area (m²)</Label>
                <Input
                  id="surface_area"
                  name="surface_area"
                  type="number"
                  placeholder="e.g., 50"
                  value={formData.surface_area}
                  onChange={handleInputChange}
                  className="rounded-lg border-border/40"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_description" className="font-bold">Business Description</Label>
              <textarea
                id="business_description"
                name="business_description"
                placeholder="Describe your business activities and services..."
                value={formData.business_description}
                onChange={handleInputChange}
                rows={4}
                className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </CardContent>
        </Card>

        {/* Applicant Information */}
        <Card className="border-border/40 shadow-none">
          <CardHeader>
            <CardTitle className="text-lg">Applicant Information</CardTitle>
            <CardDescription>Your personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="applicant_name" className="font-bold">Full Name *</Label>
                <Input
                  id="applicant_name"
                  name="applicant_name"
                  value={formData.applicant_name}
                  onChange={handleInputChange}
                  required
                  className="rounded-lg border-border/40"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="applicant_cin" className="font-bold">CIN/ID Number *</Label>
                <Input
                  id="applicant_cin"
                  name="applicant_cin"
                  placeholder="e.g., AB123456"
                  value={formData.applicant_cin}
                  onChange={handleInputChange}
                  required
                  className="rounded-lg border-border/40"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents Upload */}
        <Card className="border-border/40 shadow-none">
          <CardHeader>
            <CardTitle className="text-lg">Required Documents</CardTitle>
            <CardDescription>Upload supporting documents (business plan, ID, property docs, etc.)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="files" className="font-bold">Upload Documents</Label>
              <div className="relative">
                <input
                  id="files"
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                />
                <label
                  htmlFor="files"
                  className="flex items-center justify-center gap-2 px-6 py-8 border-2 border-dashed border-border/40 rounded-lg cursor-pointer hover:border-primary/40 transition-colors"
                >
                  <Upload className="w-5 h-5 text-muted-foreground" />
                  <div className="text-center">
                    <p className="text-sm font-medium">Click to upload or drag and drop</p>
                    <p className="text-xs text-muted-foreground">PDF, DOCX, or image files</p>
                  </div>
                </label>
              </div>

              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-bold">{files.length} file(s) selected:</p>
                  <div className="space-y-2">
                    {files.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm flex-1 truncate">{file.name}</span>
                        <span className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={loading}
            className="bg-primary text-primary-foreground hover:scale-[1.02] active:scale-[0.98] transition-all font-bold rounded-lg"
          >
            {loading ? "Submitting..." : "Submit Business Permit Request"}
          </Button>
          <Link href="/dashboard/business-permits">
            <Button type="button" variant="outline" className="rounded-lg">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
