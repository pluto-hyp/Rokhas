import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import ConstructionBackgroundLoader from "@/components/ConstructionBackgroundLoader";

export default function PrivacyPage() {
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
              Privacy<br />
              <span className="opacity-20 italic">Policy.</span>
            </h1>
          </div>

          <div className="prose prose-neutral max-w-none space-y-12 text-primary/70 font-medium leading-relaxed">
            <section className="space-y-4">
              <h2 className="font-serif text-3xl text-primary font-bold tracking-tight">1. Commitment to Privacy</h2>
              <p>
                Rokhas is committed to protecting the privacy and security of our users' personal and professional data. 
                This policy outlines our practices regarding the collection, use, and safeguarding of information within our 
                digital administration platform.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-serif text-3xl text-primary font-bold tracking-tight">2. CNDP Compliance</h2>
              <p>
                All personal data processing carried out through this platform is performed in strict accordance with 
                <strong> Moroccan Law No. 09-08</strong> relating to the protection of individuals with regard to the 
                processing of personal data, as regulated by the <strong>Commission Nationale de contrôle de la 
                protection des Données à caractère Personnel (CNDP)</strong>.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-serif text-3xl text-primary font-bold tracking-tight">3. Data Collection</h2>
              <p>
                We collect information necessary for the processing of urbanism permits and administrative requests, including:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Identification data (Full Name, CIN, Contact details)</li>
                <li>Professional credentials for Architects and Authorities</li>
                <li>Technical documentation and architectural blueprints</li>
                <li>Geographical and cadastral data related to projects</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="font-serif text-3xl text-primary font-bold tracking-tight">4. Purpose of Processing</h2>
              <p>
                The data collected is used exclusively for the digital management of the construction lifecycle, 
                streamlining review processes, and issuing digital certificates with verifiable security.
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
