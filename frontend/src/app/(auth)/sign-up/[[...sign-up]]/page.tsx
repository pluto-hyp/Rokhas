import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-topography flex items-center justify-center py-20 px-6">
      <div className="relative z-10">
        <SignUp 
          appearance={{
            elements: {
              card: "bg-white shadow-xl rounded-3xl p-8 border border-[var(--color-border)]",
              headerTitle: "font-serif text-3xl font-bold text-[#1C1917]",
              headerSubtitle: "text-[var(--color-text-muted)]",
              socialButtonsBlockButton: "border border-[var(--color-border)] hover:bg-[#F4F1EA] rounded-full",
              dividerLine: "bg-[var(--color-border)]",
              dividerText: "text-[var(--color-text-muted)]",
              formFieldLabel: "font-semibold text-[#1C1917]",
              formFieldInput: "rounded-lg border-[var(--color-border)] focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]",
              formButtonPrimary: "bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] rounded-full text-sm font-semibold text-white",
              footerActionLink: "text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] font-semibold"
            }
          }}
        />
      </div>
    </div>
  );
}
