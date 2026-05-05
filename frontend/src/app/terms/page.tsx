import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import ConstructionBackgroundLoader from "@/components/ConstructionBackgroundLoader";

export default function TermsPage() {
  return (
    <div className="min-h-screen font-sans text-primary selection:bg-primary selection:text-background">
      <ConstructionBackgroundLoader />
      <Navbar />
      
      <main className="pt-60 pb-32 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="space-y-4 mb-16">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary/40">
              Legal Documentation
            </span>
            <h1 className="font-serif text-6xl md:text-8xl font-bold tracking-tighter leading-none text-primary">
              Terms of<br />
              <span className="opacity-20 italic">Service.</span>
            </h1>
          </div>

          <div className="prose prose-neutral max-w-none space-y-12 text-primary/70 font-medium leading-relaxed">
            <section className="space-y-4">
              <h2 className="font-serif text-3xl text-primary font-bold tracking-tight">1. Acceptance of Terms</h2>
              <p>
                By accessing and using the Rokhas platform, you agree to be bound by these Terms of Service and all 
                applicable laws and regulations governing Moroccan urbanism and digital administration.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-serif text-3xl text-primary font-bold tracking-tight">2. User Categories</h2>
              <p>
                This platform is designed for three main stakeholder categories:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Citizens:</strong> For personal permit requests and tracking.</li>
                <li><strong>Architects:</strong> For professional submission and plan validation.</li>
                <li><strong>Authorities:</strong> For official review and digital certification.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="font-serif text-3xl text-primary font-bold tracking-tight">3. Data Accuracy</h2>
              <p>
                Users are solely responsible for the accuracy and legality of all documents, blueprints, and data 
                uploaded to the platform. Falsification of documents is subject to legal prosecution under Moroccan 
                administrative law.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-serif text-3xl text-primary font-bold tracking-tight">4. Intellectual Property</h2>
              <p>
                While users retain ownership of their uploaded architectural designs, the Rokhas platform architecture, 
                codebase, and design system are the exclusive property of its developers.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-serif text-3xl text-primary font-bold tracking-tight">5. Jurisdiction</h2>
              <p>
                Any disputes arising from the use of this platform shall be governed by the laws of the Kingdom of 
                Morocco and shall be subject to the exclusive jurisdiction of the competent Moroccan courts.
              </p>
            </section>

            <div className="pt-12 border-t border-border/40">
              <Link href="/" className="text-sm font-bold uppercase tracking-widest hover:opacity-50 transition-opacity">
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
