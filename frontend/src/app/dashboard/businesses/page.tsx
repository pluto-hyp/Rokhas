"use client";

import { useEffect, useState } from "react";
import { 
  Building2, 
  Search, 
  Plus, 
  Filter, 
  MoreHorizontal,
  CheckCircle2,
  Printer,
  AlertCircle,
  X,
  FileText,
  Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { OfficialBusinessPermitCertificate, BusinessPermitCertificateData } from "@/components/OfficialBusinessPermitCertificate";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [permits, setPermits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { token, user: authUser } = useAuth();
  const role = authUser?.role || "citizen";
  const [activeTab, setActiveTab] = useState<"permits" | "registered">("permits");

  const [showPermitModal, setShowPermitModal] = useState(false);
  const [selectedPermit, setSelectedPermit] = useState<any | null>(null);
  const [selectedBusiness, setSelectedBusiness] = useState<any | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!token) return;
      try {
        const [bizResponse, permitsResponse] = await Promise.all([
          fetch(`${API_URL}/api/v1/businesses/`, {
            headers: { "Authorization": `Bearer ${token}` }
          }),
          fetch(`${API_URL}/api/v1/business-permits/`, {
            headers: { "Authorization": `Bearer ${token}` }
          })
        ]);
        
        if (bizResponse.ok) {
          const data = await bizResponse.json();
          setBusinesses(data);
        }
        
        if (permitsResponse.ok) {
          const data = await permitsResponse.json();
          setPermits(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [token]);

  const getStatusBadge = (status: string) => {
    if (status === "Approved") {
      return (
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20">
          <CheckCircle2 className="size-3" /> Approved
        </span>
      );
    }
    if (status === "Pending") {
      return (
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20">
          <AlertCircle className="size-3" /> Pending
        </span>
      );
    }
    if (status === "Under Review") {
      return (
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold text-blue-500 bg-blue-500/10 border border-blue-500/20">
          <Clock className="size-3" /> Under Review
        </span>
      );
    }
    return (
      <Badge variant="outline" className="rounded-full px-2 py-0.5 text-[10px] font-bold">
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-8 px-4 py-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Businesses</h1>
          <p className="text-muted-foreground mt-1">
            {role === "authority" || role === "admin"
              ? "Review pending business permit requests and manage registered businesses."
              : "Track your business information and registrations."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search businesses..." className="pl-10 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Tabs for Authority/Admin */}
      {(role === "authority" || role === "admin") && (
        <div className="flex gap-4 border-b border-border/40">
          <button
            onClick={() => setActiveTab("permits")}
            className={cn(
              "px-4 py-3 font-semibold text-sm border-b-2 transition-colors",
              activeTab === "permits"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Permit Requests
            {permits.some(p => p.status === "Pending") && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                {permits.filter(p => p.status === "Pending").length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("registered")}
            className={cn(
              "px-4 py-3 font-semibold text-sm border-b-2 transition-colors",
              activeTab === "registered"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Registered
          </button>
        </div>
      )}

      {/* Business Permit Requests Tab */}
      {(role === "authority" || role === "admin" ? activeTab === "permits" : false) && (
        <Card className="border-border/40 shadow-none bg-card overflow-hidden">
          <div className="p-4 border-b border-border/40 flex items-center justify-between">
            <p className="text-xs text-muted-foreground font-bold">{permits.length} business permit requests</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/40">
                <tr>
                  <th className="px-6 py-4">Business Name</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Applicant</th>
                  <th className="px-6 py-4">Submitted</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {loading ? (
                  [1, 2, 3].map(i => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="px-6 py-8 h-12 bg-muted/10" />
                    </tr>
                  ))
                ) : permits.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center text-muted-foreground">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      <p>No business permit requests yet.</p>
                    </td>
                  </tr>
                ) : (
                  permits.map((permit) => (
                    <tr key={permit.id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold">{permit.business_name}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-muted-foreground">{permit.business_type}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs">{permit.applicant_name}</p>
                      </td>
                      <td className="px-6 py-4 text-xs text-muted-foreground">
                        {new Date(permit.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(permit.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {permit.status === "Pending" || permit.status === "Under Review" ? (
                          <Button
                            size="sm"
                            variant="default"
                            className="gap-2 text-xs bg-blue-600 hover:bg-blue-700"
                            onClick={() => {
                              window.location.href = `/dashboard/business-permits/${permit.id}`;
                            }}
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            Review
                          </Button>
                        ) : permit.status === "Approved" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2 text-xs"
                            onClick={() => {
                              setSelectedPermit(permit);
                              setShowPermitModal(true);
                            }}
                          >
                            <Printer className="w-3 h-3" />
                            View License
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">{permit.status}</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Registered Businesses Tab */}
      {(!role || activeTab === "registered" || (role !== "authority" && role !== "admin")) && (
        <Card className="border-border/40 shadow-none bg-white overflow-hidden">
          <div className="p-4 bg-muted/10 border-b border-border/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="rounded-lg gap-2 text-xs">
                <Filter className="w-3 h-3" />
                Filter
              </Button>
            </div>
            <p className="text-xs text-muted-foreground font-bold">{businesses.length} businesses found</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-muted/10 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-6 py-4">Business Name</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Reg. Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {loading ? (
                  [1, 2, 3].map(i => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-6 py-8 h-12 bg-muted/10" />
                    </tr>
                  ))
                ) : businesses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center text-muted-foreground">
                      <Building2 className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      <p>No businesses found.</p>
                    </td>
                  </tr>
                ) : (
                  businesses.map((biz) => (
                    <tr key={biz.id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-foreground">{biz.name}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-muted-foreground">{biz.type}</p>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-muted-foreground">
                        {new Date(biz.registration_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(biz.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {biz.status === "Approved" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2 text-xs"
                            onClick={() => {
                              setSelectedBusiness(biz);
                              setShowPermitModal(true);
                            }}
                          >
                            <Printer className="w-3 h-3" />
                            View License
                          </Button>
                        ) : (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Certificate Modal */}
      {showPermitModal && selectedPermit && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-background/90 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-8">
            <OfficialBusinessPermitCertificate 
              data={{
                dossier_id: selectedPermit.id,
                applicant_name: selectedPermit.applicant_name || "Business Owner",
                applicant_cin: selectedPermit.applicant_cin || "Not provided",
                business_name: selectedPermit.business_name,
                business_type: selectedPermit.business_type || "Commercial Activity",
                business_description: selectedPermit.business_description || "Professional commercial activity",
                location: selectedPermit.address || "Not specified",
                land_reference: `PERMIT-${selectedPermit.id}`,
                dimensions: { surface_terrain: selectedPermit.surface_area },
                zone: selectedPermit.zone || "Commercial Zone",
                signed_by: selectedPermit.signed_by || "Municipal Authority",
                signature_hash: selectedPermit.signature_hash || "",
                signed_at: selectedPermit.signed_at || new Date().toISOString(),
              }}
              onClose={() => { setShowPermitModal(false); setSelectedPermit(null); }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
