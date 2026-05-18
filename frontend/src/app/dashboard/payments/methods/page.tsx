"use client";

import { useState } from "react";
import { Plus, Trash2, ShieldCheck, CreditCard } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface SavedCard {
  id: string;
  brand: string;
  bankName: string;
  last4: string;
  expiry: string;
  holderName: string;
  isDefault: boolean;
}

export default function BillingMethodsPage() {
  const [cards, setCards] = useState<SavedCard[]>([
    {
      id: "pm_1",
      brand: "Visa",
      bankName: "Attijariwafa Bank",
      last4: "4242",
      expiry: "12/28",
      holderName: "Kamal Alami",
      isDefault: true
    },
    {
      id: "pm_2",
      brand: "Mastercard",
      bankName: "Banque Populaire",
      last4: "9876",
      expiry: "08/27",
      holderName: "Kamal Alami",
      isDefault: false
    }
  ]);

  const [formData, setFormData] = useState({
    holderName: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
    bankName: "Attijariwafa Bank"
  });

  const [companyInfo, setCompanyInfo] = useState({
    patentNumber: "PAT-8492019-B",
    ice: "001928401928401",
    address: "Angle Boulevard Anfa & Rue Moulay Youssef",
    city: "Casablanca",
    zipCode: "20000"
  });

  const [addingCard, setAddingCard] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setCompanyInfo(prev => ({ ...prev, [id]: value }));
  };

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.holderName || !formData.cardNumber || !formData.expiry || !formData.cvv) {
      toast.error("Please fill in all card details.");
      return;
    }

    setAddingCard(true);
    setTimeout(() => {
      const newCard: SavedCard = {
        id: `pm_${Date.now()}`,
        brand: formData.cardNumber.startsWith("5") ? "Mastercard" : "Visa",
        bankName: formData.bankName,
        last4: formData.cardNumber.slice(-4) || "4321",
        expiry: formData.expiry,
        holderName: formData.holderName,
        isDefault: cards.length === 0
      };

      setCards(prev => [...prev, newCard]);
      setFormData({ holderName: "", cardNumber: "", expiry: "", cvv: "", bankName: "Attijariwafa Bank" });
      setAddingCard(false);
      toast.success("Card profile securely linked via CMI!");
    }, 1000);
  };

  const handleDeleteCard = (id: string) => {
    const cardToDelete = cards.find(c => c.id === id);
    if (cardToDelete?.isDefault && cards.length > 1) {
      toast.error("Please set another card as default before deleting this one.");
      return;
    }
    setCards(prev => prev.filter(c => c.id !== id));
    toast.success("Payment profile removed.");
  };

  const handleSetDefault = (id: string) => {
    setCards(prev => prev.map(c => ({
      ...c,
      isDefault: c.id === id
    })));
    toast.success("Default payment profile updated.");
  };

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Billing preferences and company identifiers updated successfully.");
  };

  return (
    <div className="space-y-6 px-4 py-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Billing & Payment Methods
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage saved credit profiles, CMI authorization gates, and corporate tax identifiers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns - Saved Cards and Add Card */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Saved Cards */}
          <Card className="rounded-lg border bg-card">
            <CardHeader className="px-6 py-4 border-b">
              <CardTitle className="text-base font-semibold">Active Cards & Profiles</CardTitle>
              <CardDescription className="text-xs">
                Saved card profiles used for instant construction tax clearances.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-border">
              {cards.length === 0 ? (
                <p className="p-6 text-center text-xs text-muted-foreground">No saved card profiles.</p>
              ) : (
                cards.map((card) => (
                  <div key={card.id} className="flex items-center justify-between p-5 hover:bg-muted/30 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-foreground">
                          {card.brand} •••• {card.last4}
                        </span>
                        {card.isDefault && (
                          <span className="text-[9px] font-semibold bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20">
                            Primary
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground font-medium">
                        {card.bankName} • Holder: {card.holderName} • Exp: {card.expiry}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {!card.isDefault && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleSetDefault(card.id)}
                          className="h-8 text-xs text-muted-foreground hover:text-foreground"
                        >
                          Set Primary
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDeleteCard(card.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Add Card Form */}
          <Card className="rounded-lg border bg-card">
            <CardHeader className="px-6 py-4 border-b">
              <CardTitle className="text-base font-semibold">Add Card Profile</CardTitle>
            </CardHeader>
            <form onSubmit={handleAddCard}>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="holderName" className="text-xs font-semibold text-muted-foreground uppercase">Cardholder Name</Label>
                    <Input 
                      id="holderName" 
                      value={formData.holderName}
                      onChange={handleInputChange}
                      placeholder="Kamal Alami" 
                      className="h-9 rounded border"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="bankName" className="text-xs font-semibold text-muted-foreground uppercase">Affiliated Bank</Label>
                    <Input 
                      id="bankName" 
                      value={formData.bankName}
                      onChange={handleInputChange}
                      placeholder="Attijariwafa Bank" 
                      className="h-9 rounded border"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="cardNumber" className="text-xs font-semibold text-muted-foreground uppercase">Card Number</Label>
                  <div className="relative">
                    <Input 
                      id="cardNumber" 
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      placeholder="4000 1234 5678 9010" 
                      maxLength={16}
                      className="h-9 rounded border pl-10"
                      required
                    />
                    <CreditCard className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="expiry" className="text-xs font-semibold text-muted-foreground uppercase">Expiry Date</Label>
                    <Input 
                      id="expiry" 
                      value={formData.expiry}
                      onChange={handleInputChange}
                      placeholder="MM/YY" 
                      maxLength={5}
                      className="h-9 rounded border"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="cvv" className="text-xs font-semibold text-muted-foreground uppercase">CVV</Label>
                    <Input 
                      id="cvv" 
                      type="password" 
                      value={formData.cvv}
                      onChange={handleInputChange}
                      placeholder="•••" 
                      maxLength={3}
                      className="h-9 rounded border"
                      required
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-4 border-t bg-muted/5 flex justify-end">
                <Button type="submit" disabled={addingCard} className="h-9 rounded font-medium">
                  {addingCard ? "Saving Card..." : "Save Card Profile"}
                </Button>
              </CardFooter>
            </form>
          </Card>

        </div>

        {/* Right Column - Billing Settings */}
        <div className="space-y-6">
          
          {/* Corporate Invoice Settings */}
          <Card className="rounded-lg border bg-card">
            <CardHeader className="px-6 py-4 border-b">
              <CardTitle className="text-base font-semibold">Corporate Invoice Info</CardTitle>
              <CardDescription className="text-xs">
                These settings will be dynamically printed on municipal tax bills.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSaveCompany}>
              <CardContent className="p-4 space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="patentNumber" className="text-xs font-semibold text-muted-foreground uppercase">Patent Number</Label>
                  <Input 
                    id="patentNumber" 
                    value={companyInfo.patentNumber}
                    onChange={handleCompanyChange}
                    className="h-9 rounded border text-xs"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="ice" className="text-xs font-semibold text-muted-foreground uppercase">ICE (Identifiant Commun)</Label>
                  <Input 
                    id="ice" 
                    value={companyInfo.ice}
                    onChange={handleCompanyChange}
                    className="h-9 rounded border text-xs"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="address" className="text-xs font-semibold text-muted-foreground uppercase">Billing Address</Label>
                  <Input 
                    id="address" 
                    value={companyInfo.address}
                    onChange={handleCompanyChange}
                    className="h-9 rounded border text-xs"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="city" className="text-xs font-semibold text-muted-foreground uppercase">City</Label>
                    <Input 
                      id="city" 
                      value={companyInfo.city}
                      onChange={handleCompanyChange}
                      className="h-9 rounded border text-xs"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="zipCode" className="text-xs font-semibold text-muted-foreground uppercase">Zip Code</Label>
                    <Input 
                      id="zipCode" 
                      value={companyInfo.zipCode}
                      onChange={handleCompanyChange}
                      className="h-9 rounded border text-xs"
                      required
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-3 border-t bg-muted/5 flex justify-end">
                <Button type="submit" className="h-8 rounded text-xs font-medium">
                  Save Settings
                </Button>
              </CardFooter>
            </form>
          </Card>

          {/* Secure vault prompt */}
          <Card className="rounded-lg border bg-card/40">
            <CardContent className="p-4 text-xs text-muted-foreground leading-relaxed flex gap-2">
              <ShieldCheck className="size-5 text-primary shrink-0" />
              <div>
                <p className="font-semibold text-foreground mb-0.5">Secure CMI Integration</p>
                Card details are fully tokenized and verified against local banking interfaces. Official tax assessments and invoices are settled utilizing encrypted digital transaction seals.
              </div>
            </CardContent>
          </Card>

        </div>

      </div>
    </div>
  );
}
