"use client";

import { useState } from "react";
import { 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Download, 
  Plus, 
  ShieldCheck, 
  Building,
  ArrowRight,
  Receipt,
  X,
  Lock
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Invoice {
  id: string;
  dossierTitle: string;
  category: "Construction Tax" | "Zoning Audit Fee" | "Sanitary Inspection" | "Commercial License";
  amount: number;
  dueDate: string;
  status: "Paid" | "Pending" | "Overdue";
  ref: string;
}

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expiry: string;
  isDefault: boolean;
}

export default function PaymentsPage() {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: "INV-2026-0811",
      dossierTitle: "Villa Oasis - Structural Expansion (Rabat)",
      category: "Construction Tax",
      amount: 14500.00,
      dueDate: "2026-06-05",
      status: "Pending",
      ref: "RKH-2026-0412"
    },
    {
      id: "INV-2026-0792",
      dossierTitle: "Commercial Bakery Plot 4 (Casablanca)",
      category: "Commercial License",
      amount: 3800.00,
      dueDate: "2026-05-28",
      status: "Pending",
      ref: "RKH-2026-0188"
    },
    {
      id: "INV-2026-0610",
      dossierTitle: "Apartment complex safety layout",
      category: "Zoning Audit Fee",
      amount: 9200.00,
      dueDate: "2026-04-12",
      status: "Paid",
      ref: "RKH-2026-0091"
    },
    {
      id: "INV-2026-0504",
      dossierTitle: "Water connection inspection desk",
      category: "Sanitary Inspection",
      amount: 1600.00,
      dueDate: "2026-03-30",
      status: "Paid",
      ref: "RKH-2026-0012"
    }
  ]);

  const [paymentMethods] = useState<PaymentMethod[]>([
    { id: "pm_1", brand: "Visa / CMI", last4: "4242", expiry: "12/28", isDefault: true },
    { id: "pm_2", brand: "Mastercard / Attijari", last4: "9876", expiry: "08/27", isDefault: false }
  ]);

  // Calculate stats
  const totalPending = invoices
    .filter(inv => inv.status !== "Paid")
    .reduce((sum, inv) => sum + inv.amount, 0);

  const totalPaid = invoices
    .filter(inv => inv.status === "Paid")
    .reduce((sum, inv) => sum + inv.amount, 0);

  const handlePayClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsPayModalOpen(true);
  };

  const handleProcessPayment = () => {
    if (!selectedInvoice) return;
    setIsProcessing(true);

    setTimeout(() => {
      setInvoices(prev => 
        prev.map(inv => 
          inv.id === selectedInvoice.id ? { ...inv, status: "Paid" } : inv
        )
      );
      setIsProcessing(false);
      setIsPayModalOpen(false);
      setSelectedInvoice(null);
      toast.success("Payment completed successfully via CMI Gate! Official transaction bill linked.");
    }, 1500);
  };

  const handleDownloadReceipt = (invoice: Invoice) => {
    toast.success(`Receipt for invoice ${invoice.id} exported successfully.`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Paid":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20">
            <CheckCircle2 className="size-3.5" /> Paid & Logged
          </span>
        );
      case "Overdue":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-destructive bg-destructive/10 border border-destructive/20 animate-pulse">
            <AlertCircle className="size-3.5" /> Overdue
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20">
            <Clock className="size-3.5" /> Pending Fee
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 px-4 py-4 relative">
      <div className="absolute top-0 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            <CreditCard className="size-8 text-primary" />
            Architect Billing Center
          </h1>
          <p className="text-muted-foreground mt-1 font-medium">
            Monitor state construction planning taxes and environmental safety audit fee settlements (Moroccan Dirham).
          </p>
        </div>
      </div>

      {/* Overview Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-border/40 shadow-sm bg-card hover:border-border/80 transition-all">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Pending MAD Balance</p>
                <p className="text-3xl font-black text-foreground">{totalPending.toLocaleString()} DH</p>
                <p className="text-[10px] font-bold text-amber-500">
                  Required before validation
                </p>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
                <Clock className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 shadow-sm bg-card hover:border-border/80 transition-all">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Settled Planning Taxes</p>
                <p className="text-3xl font-black text-foreground">{totalPaid.toLocaleString()} DH</p>
                <p className="text-[10px] font-semibold text-muted-foreground">Transmitted to Commune Ledger</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 shadow-sm bg-card hover:border-border/80 transition-all">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Dossiers Invoiced</p>
                <p className="text-3xl font-black text-foreground">{invoices.length}</p>
                <p className="text-[10px] font-semibold text-muted-foreground">Municipal tax assessments</p>
              </div>
              <div className="p-3 rounded-xl bg-primary/10 text-primary">
                <Receipt className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 shadow-sm bg-card hover:border-border/80 transition-all">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Payment Gate</p>
                <p className="text-3xl font-black text-emerald-500">
                  CMI Secure
                </p>
                <p className="text-[10px] font-bold text-emerald-500 flex items-center gap-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  National Portal Certified
                </p>
              </div>
              <div className="p-3 rounded-xl bg-primary/10 text-primary">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Billing Tables & Methods section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Outstanding & Settled Invoices List */}
        <Card className="lg:col-span-2 border-border/40 shadow-sm bg-card">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Municipal Billing Ledger</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="space-y-4">
              {invoices.map((inv) => (
                <div 
                  key={inv.id} 
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-border/40 bg-muted/10 rounded-2xl hover:border-border/80 transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0">
                      <Building className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-foreground truncate">{inv.dossierTitle}</h4>
                      <p className="text-xs text-muted-foreground font-medium mt-0.5">{inv.category}</p>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground/80 mt-1">
                        <span><strong>Ref:</strong> {inv.ref}</span>
                        <span>•</span>
                        <span><strong>Due:</strong> {inv.dueDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-border/20">
                    <div className="text-right">
                      <p className="text-base font-black text-foreground">{inv.amount.toLocaleString()} DH</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">{inv.id}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {getStatusBadge(inv.status)}

                      {inv.status === "Pending" ? (
                        <Button 
                          onClick={() => handlePayClick(inv)}
                          size="sm"
                          className="rounded-lg h-9 bg-primary text-primary-foreground font-bold hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1 shadow-md shadow-primary/10"
                        >
                          Settle
                          <ArrowRight className="size-3.5" />
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => handleDownloadReceipt(inv)}
                          variant="outline"
                          size="icon"
                          className="rounded-lg h-9 w-9 border-border/40"
                          title="Download Receipt"
                        >
                          <Download className="size-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Card Management Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-border/40 shadow-sm bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-lg font-bold">Saved Card Profiles</CardTitle>
              </div>
              <Button size="icon" variant="outline" className="size-8 rounded-lg border-border/40" onClick={() => toast.success("Securely linkingAttijari / Banque Populaire profiles")}>
                <Plus className="size-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4">
              {paymentMethods.map((method) => (
                <div key={method.id} className="p-4 rounded-xl border border-border/40 bg-muted/10 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-card border border-border/40 text-foreground shrink-0 font-black text-[10px] uppercase">
                      {method.brand}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">•••• •••• •••• {method.last4}</p>
                      <p className="text-[10px] text-muted-foreground font-medium mt-0.5">Expires {method.expiry}</p>
                    </div>
                  </div>
                  {method.isDefault && (
                    <span className="text-[9px] font-extrabold uppercase bg-primary/10 text-primary px-2 py-0.5 rounded-md border border-primary/20">
                      Default
                    </span>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/40 shadow-sm bg-primary/5 border-primary/10">
            <CardContent className="p-6 flex gap-3 text-xs leading-relaxed">
              <Lock className="size-5 text-primary shrink-0" />
              <div>
                <p className="font-bold text-foreground">Moroccan CMI Crypto Protocol</p>
                <p className="text-muted-foreground mt-0.5">
                  All transactions are routed via verified regional municipal vaults. Once paid, the system transmits an immutable digital receipt to the municipal desk for permit extraction.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>

      {/* Pay Invoice Backdrop Modal */}
      {isPayModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-card border border-border/40 rounded-3xl shadow-2xl p-6 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col gap-6">
            
            <div className="flex items-center justify-between border-b border-border/40 pb-4 relative">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Receipt className="size-5 text-primary" />
                Settle Planning Tax
              </h3>
              <button 
                type="button"
                onClick={() => setIsPayModalOpen(false)}
                className="size-8 rounded-full border border-border/40 hover:bg-muted flex items-center justify-center transition-all hover:scale-105 active:scale-95"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="bg-muted/20 border border-border/40 rounded-2xl p-4 space-y-3">
              <div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Invoice Reference</p>
                <p className="text-sm font-bold text-foreground">{selectedInvoice.id}</p>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Dossier / Permit Name</p>
                <p className="text-xs font-semibold text-foreground truncate">{selectedInvoice.dossierTitle}</p>
              </div>

              <div className="flex items-center justify-between border-t border-border/20 pt-2 mt-2">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Type</p>
                  <p className="text-xs font-semibold text-foreground">{selectedInvoice.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Due Amount</p>
                  <p className="text-lg font-black text-foreground">{selectedInvoice.amount.toLocaleString()} DH</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Payment Card</Label>
              <div className="space-y-2">
                {paymentMethods.map((method) => (
                  <label 
                    key={method.id} 
                    className="flex items-center justify-between p-3 rounded-xl border border-border/40 bg-muted/10 cursor-pointer hover:bg-muted/20 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        name="payment_method" 
                        defaultChecked={method.isDefault}
                        className="accent-primary"
                      />
                      <span className="text-xs font-bold text-foreground">{method.brand} ending in {method.last4}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-medium">Exp {method.expiry}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsPayModalOpen(false)}
                className="h-11 rounded-xl border border-border/40 font-bold text-sm hover:bg-muted transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleProcessPayment}
                disabled={isProcessing}
                className="h-11 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-primary/10"
              >
                {isProcessing ? "Processing..." : `Settle ${selectedInvoice.amount.toLocaleString()} DH`}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
