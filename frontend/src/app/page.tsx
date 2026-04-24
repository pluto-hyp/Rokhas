import Link from "next/link";
import { SignInButton, Show, UserButton } from "@clerk/nextjs";
import ConstructionBackground from "@/components/ConstructionBackground";

export default function Home() {
  return (
    <div className="min-h-screen font-sans text-[var(--color-text)]">
      <ConstructionBackground />
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-[#0F172A]/80 backdrop-blur-md z-50 border-b border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="font-serif text-3xl font-bold tracking-tight text-[var(--color-primary)]">
            Rokhas.
          </div>
          <div className="flex items-center space-x-8">
            <Link href="#about" className="text-sm font-medium hover:text-[var(--color-primary)] transition-colors">About</Link>
            <Link href="#workflow" className="text-sm font-medium hover:text-[var(--color-primary)] transition-colors">Workflow</Link>
            <div className="pl-4 border-l border-[var(--color-border)]">
              <Show when="signed-out">
                <SignInButton mode="modal">
                  <button className="bg-[var(--color-primary)] text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-[var(--color-primary-hover)] transition-all shadow-sm">
                    Sign In
                  </button>
                </SignInButton>
              </Show>
              <Show when="signed-in">
                <div className="flex items-center gap-4">
                  <Link href="/dashboard" className="text-sm font-bold text-[var(--color-primary)] hover:underline">Dashboard</Link>
                  <UserButton appearance={{ elements: { avatarBox: "w-10 h-10 border-2 border-[var(--color-primary)]" } }} />
                </div>
              </Show>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-24 px-6 relative">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="font-serif text-6xl md:text-7xl lg:text-8xl font-medium leading-[1.1] text-[#F8FAFC]">
            The Blueprint of<br/>
            <span className="text-[var(--color-primary)] italic pr-4">Digital Administration.</span>
          </h1>
          <p className="text-xl md:text-2xl text-[var(--color-text-muted)] max-w-2xl mx-auto leading-relaxed font-light">
            Streamlining building permits and architectural planning in Morocco with precision, transparency, and intelligence.
          </p>
          <div className="pt-8">
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="bg-[#F8FAFC] text-[#0F172A] px-10 py-4 rounded-full text-lg font-medium hover:bg-white transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
                  Start Your Project
                </button>
              </SignInButton>
            </Show>
            <Show when="signed-in">
              <Link href="/dashboard" className="bg-[var(--color-primary)] text-white px-10 py-4 rounded-full text-lg font-medium hover:bg-[var(--color-primary-hover)] transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 inline-block">
                Go to Dashboard
              </Link>
            </Show>
          </div>
        </div>
      </section>

      {/* Who Uses Rokhas - Editorial Cards */}
      <section id="about" className="py-24 px-6 bg-transparent border-y border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 md:flex justify-between items-end border-b border-[var(--color-border)] pb-8">
            <div className="max-w-2xl">
              <h2 className="font-serif text-4xl md:text-5xl font-medium mb-4 text-[#F8FAFC]">A Unified Ecosystem</h2>
              <p className="text-lg text-[var(--color-text-muted)]">Connecting every stakeholder in the construction lifecycle.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-[#1E293B] rounded-3xl p-10 transition-all hover:bg-[#334155]">
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-8 shadow-sm">
                <svg className="w-6 h-6 text-[var(--color-primary)]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
              </div>
              <h3 className="font-serif text-3xl font-medium mb-4">Citizens</h3>
              <p className="text-[var(--color-text-muted)] leading-relaxed">
                Submit personal building permit requests, track their progress in real-time, and download approved certificates directly without physical visits.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-[var(--color-primary)] text-white rounded-3xl p-10 transition-all hover:bg-[var(--color-primary-hover)] shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <svg className="w-48 h-48" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"></path></svg>
              </div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-8">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                </div>
                <h3 className="font-serif text-3xl font-medium mb-4">Architects</h3>
                <p className="text-white/80 leading-relaxed">
                  Attach technical plans, structural blueprints, and validate project documentation against municipal regulations securely.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-[#1E293B] rounded-3xl p-10 transition-all hover:bg-[#334155]">
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-8 shadow-sm">
                <svg className="w-6 h-6 text-[var(--color-primary)]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <h3 className="font-serif text-3xl font-medium mb-4">Municipalities</h3>
              <p className="text-[var(--color-text-muted)] leading-relaxed">
                Review incoming applications, communicate directly with architects, and formally approve permits via secure digital signatures.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Timeline */}
      <section id="workflow" className="py-32 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="font-serif text-4xl md:text-5xl font-medium mb-20 text-[#F8FAFC]">How It Works</h2>
          
          <div className="grid md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-10 left-[12%] right-[12%] h-[1px] bg-gradient-to-r from-transparent via-[#F8FAFC]/20 to-transparent"></div>
            
            {[
              { num: '01', title: 'Submit', desc: 'Upload architectural CADs & PDF documents.' },
              { num: '02', title: 'Review', desc: 'AI compliance checks & municipal review.' },
              { num: '03', title: 'Inspect', desc: 'On-site verification via mobile app.' },
              { num: '04', title: 'Approve', desc: 'Digital issuance of the official permit.' }
            ].map((step, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center">
                <div className="w-20 h-20 bg-[#1E293B] border border-[#F8FAFC]/10 rounded-full flex items-center justify-center font-serif text-3xl text-[var(--color-primary)] mb-6 shadow-sm">
                  {step.num}
                </div>
                <h4 className="text-xl font-bold mb-2">{step.title}</h4>
                <p className="text-sm text-[var(--color-text-muted)]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F172A] text-white py-16 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 items-center border-b border-white/10 pb-16">
          <div>
            <div className="font-serif text-4xl font-bold tracking-tight text-[var(--color-primary)] mb-4">
              Rokhas.
            </div>
            <p className="text-white/60 max-w-sm">
              Engineered for precision. Designed for Moroccan Urbanism.
            </p>
          </div>
          <div className="flex md:justify-end gap-8">
            <div className="flex flex-col gap-3">
              <span className="font-serif text-lg">Platform</span>
              <Link href="#" className="text-white/60 hover:text-white transition-colors">Features</Link>
              <Link href="#" className="text-white/60 hover:text-white transition-colors">Security</Link>
              <Link href="#" className="text-white/60 hover:text-white transition-colors">Pricing</Link>
            </div>
            <div className="flex flex-col gap-3">
              <span className="font-serif text-lg">Legal</span>
              <Link href="#" className="text-white/60 hover:text-white transition-colors">Terms of Service</Link>
              <Link href="#" className="text-white/60 hover:text-white transition-colors">Privacy Policy</Link>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 text-white/40 text-sm text-center md:text-left">
          © {new Date().getFullYear()} Rokhas Platform. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
