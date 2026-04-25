import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Show, SignInButton } from "@clerk/nextjs";
import ConstructionBackground from "@/components/ConstructionBackground";

export default function Home() {
  return (
    <div className="min-h-screen font-sans text-primary selection:bg-primary selection:text-background">
      <ConstructionBackground />
      <Navbar />

      {/* Hero Section */}
      <section className="pt-60 pb-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="space-y-4 mb-12">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary/40">
              Modern Administration
            </span>
            <h1 className="font-serif text-7xl md:text-9xl font-bold tracking-tighter leading-[0.85] text-primary">
              Rokhas<br />
              <span className="opacity-20 italic">Platform.</span>
            </h1>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-end">
            <p className="text-xl md:text-2xl text-primary/70 leading-tight font-medium max-w-md">
              The definitive blueprint for digital administration in Moroccan urbanism. Precise. Transparent. Built for scale.
            </p>
            <div className="flex md:justify-end gap-6">
              <Show when="signed-out">
                <SignInButton mode="modal">
                  <Button size="lg" className="rounded-full h-16 px-10 text-base font-bold bg-primary text-background hover:scale-105 transition-transform active:scale-95">
                    Start Your Project
                  </Button>
                </SignInButton>
              </Show>
              <Show when="signed-in">
                <Link href="/dashboard">
                  <Button size="lg" className="rounded-full h-16 px-10 text-base font-bold bg-primary text-background hover:scale-105 transition-transform">
                    Dashboard
                  </Button>
                </Link>
              </Show>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section - Minimalist Cards */}
      <section id="about" className="py-40 px-6 border-t border-border/40">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-24">
            <h2 className="font-serif text-5xl md:text-7xl font-bold tracking-tighter leading-none">
              A Unified<br />Ecosystem.
            </h2>
            <p className="text-lg text-primary/50 max-w-xs font-medium">
              Connecting every stakeholder in the construction lifecycle through one central point of truth.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-16">
            {[
              { 
                title: "Citizens", 
                desc: "Submit requests, track progress, and receive certificates digitally.",
                img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800"
              },
              { 
                title: "Architects", 
                desc: "Technical plans and structural blueprints validated securely.",
                img: "https://images.unsplash.com/photo-1542621334-a254cf47733d?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0"
              },
              { 
                title: "Authorities", 
                desc: "Streamlined review and digital approval processes.",
                img: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=800"
              }
            ].map((card, i) => (
              <div key={i} className="group cursor-pointer">
                <div className="aspect-[4/5] bg-gray-100 rounded-3xl overflow-hidden mb-6 transition-transform duration-700 group-hover:scale-[0.98]">
                  <img src={card.img} alt={card.title} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000 scale-110 group-hover:scale-100" />
                </div>
                <h3 className="font-serif text-3xl font-bold mb-2 tracking-tight">{card.title}</h3>
                <p className="text-primary/50 leading-relaxed font-medium">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer - Minimalist */}
      <footer className="py-24 px-6 border-t border-border/40">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
          <div>
            <div className="font-serif text-4xl font-bold tracking-tight mb-4">Rokhas.</div>
            <p className="text-primary/40 text-sm max-w-xs font-medium">
              Precision-engineered for Moroccan Urbanism.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-16">
            <div className="space-y-4">
              <div className="text-xs font-bold uppercase tracking-widest text-primary/30">Company</div>
              <ul className="space-y-2 text-sm font-bold">
                <li><Link href="#" className="hover:opacity-50 transition-opacity">About</Link></li>
                <li><Link href="#" className="hover:opacity-50 transition-opacity">Contact</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <div className="text-xs font-bold uppercase tracking-widest text-primary/30">Legal</div>
              <ul className="space-y-2 text-sm font-bold">
                <li><Link href="#" className="hover:opacity-50 transition-opacity">Privacy</Link></li>
                <li><Link href="#" className="hover:opacity-50 transition-opacity">Terms</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-24 text-[10px] font-bold uppercase tracking-[0.4em] text-primary/20">
          © {new Date().getFullYear()} Rokhas Platform.
        </div>
      </footer>
    </div>
  );
}
