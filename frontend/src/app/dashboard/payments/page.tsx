"use client";

import { useState } from "react";
import { Download, X } from "lucide-react";
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
      id: "INV-2026-0901",
      dossierTitle: "Restaurant - Commercial License",
      category: "Commercial License",
      amount: 4500.00,
      dueDate: "2026-03-01",
      status: "Overdue",
      ref: "RKH-2026-0193"
    },
    {
      id: "INV-2026-0811",
      dossierTitle: "Villa Oasis - Structural Expansion",
      category: "Construction Tax",
      amount: 14500.00,
      dueDate: "2026-06-05",
      status: "Pending",
      ref: "RKH-2026-0412"
    },
    {
      id: "INV-2026-0792",
      dossierTitle: "Commercial Bakery Plot 4",
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
      toast.success("Payment completed successfully! Transaction logged.");
    }, 1200);
  };

  const handleDownloadReceipt = (invoice: Invoice) => {
    toast.success(`Receipt for invoice ${invoice.id} downloaded.`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Paid":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
            Paid
          </span>
        );
      case "Overdue":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
            Overdue
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
            Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 px-4 py-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Payments & Billing
        </h1>
        <p className="text-sm text-muted-foreground">
          View active municipal taxes, manage transactions, and track structural permit fees.
        </p>
      </div>

      {/* Overview Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-lg border bg-card">
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pending Balance</p>
            <p className="text-2xl font-bold text-foreground mt-1">{totalPending.toLocaleString()} DH</p>
          </CardContent>
        </Card>

        <Card className="rounded-lg border bg-card">
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Settled Taxes</p>
            <p className="text-2xl font-bold text-foreground mt-1">{totalPaid.toLocaleString()} DH</p>
          </CardContent>
        </Card>

        <Card className="rounded-lg border bg-card">
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Invoiced</p>
            <p className="text-2xl font-bold text-foreground mt-1">{invoices.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Billing Table & Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Ledger List */}
        <Card className="lg:col-span-2 rounded-lg border bg-card">
          <CardHeader className="px-6 border-b">
            <CardTitle className="text-base font-semibold">Ledger</CardTitle>
            <CardDescription className="text-xs">
              History of municipal taxes and safety audit fee invoices.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-border">
            {invoices.map((inv) => (
              <div 
                key={inv.id} 
                className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="space-y-1 min-w-0">
                  <h4 className="text-sm font-medium text-foreground truncate">{inv.dossierTitle}</h4>
                  <p className="text-xs text-muted-foreground">{inv.category}</p>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span>Ref: {inv.ref}</span>
                    <span>•</span>
                    <span>Due: {inv.dueDate}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">{inv.amount.toLocaleString()} DH</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{inv.id}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusBadge(inv.status)}

                    {inv.status === "Pending" ? (
                      <Button 
                        onClick={() => handlePayClick(inv)}
                        size="sm"
                        className="h-8 rounded"
                      >
                        Settle
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => handleDownloadReceipt(inv)}
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded border"
                      >
                        <Download className="size-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Card Management */}
        <div className="space-y-4">
          <Card className="rounded-lg border bg-card">
            <CardHeader className="px-6 border-b">
              <CardTitle className="text-base font-semibold">Saved Cards</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {paymentMethods.map((method) => (
                <div 
                  key={method.id} 
                  className="p-3 rounded border bg-muted/20 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <p className="font-medium text-foreground">•••• •••• •••• {method.last4}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{method.brand} • Exp {method.expiry}</p>
                  </div>
                  {method.isDefault && (
                    <span className="text-[9px] font-semibold bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20">
                      Default
                    </span>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-lg border bg-card/40">
            <CardContent className="text-xs text-muted-foreground leading-relaxed">
              <p className="font-semibold text-foreground mb-1">CMI Protocol Security</p>
              Transactions are securely processed through regional government vaults. Once paid, the validation ledger automatically links receipt logs to your dossiers.
            </CardContent>
          </Card>
        </div>

      </div>

      {/* Pay Modal Dialog */}
      {isPayModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="relative w-full max-w-sm bg-card border rounded-lg shadow-lg p-5 flex flex-col gap-4 animate-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-semibold text-foreground">Settle Invoice</h3>
              <button 
                onClick={() => setIsPayModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reference:</span>
                <span className="font-medium text-foreground">{selectedInvoice.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Permit Name:</span>
                <span className="font-medium text-foreground truncate max-w-[180px]">{selectedInvoice.dossierTitle}</span>
              </div>
              <div className="flex justify-between border-t pt-2 font-medium">
                <span className="text-muted-foreground">Due Amount:</span>
                <span className="text-foreground">{selectedInvoice.amount.toLocaleString()} DH</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Select Payment Card</Label>
              <div className="space-y-1">
                {paymentMethods.map((method) => (
                  <label 
                    key={method.id} 
                    className="flex items-center justify-between p-2 rounded border bg-muted/10 cursor-pointer text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <input 
                        type="radio" 
                        name="payment_method_modal" 
                        defaultChecked={method.isDefault}
                        className="accent-primary"
                      />
                      <span className="font-medium text-foreground">{method.brand} •••• {method.last4}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
              <Button
                variant="outline"
                onClick={() => setIsPayModalOpen(false)}
                className="h-9 rounded"
              >
                Cancel
              </Button>
              <Button
                onClick={handleProcessPayment}
                disabled={isProcessing}
                className="h-9 rounded"
              >
                {isProcessing ? "Processing..." : "Confirm"}
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
