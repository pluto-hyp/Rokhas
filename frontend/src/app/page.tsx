import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      {/* 1. Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>Rokhas: The Blueprint of Digital Administration.</h1>
          <p className={styles.tagline}>
            Streamlining building permits and architectural planning in Morocco with precision, speed, and intelligence.
          </p>
          <Link href="/dashboard" className={styles.ctaButton}>
            Request a Permit
          </Link>
        </div>
      </section>

      {/* 2. What is Rokhas? */}
      <section className={`${styles.section} ${styles.sectionLight}`}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>What is Rokhas?</h2>
          <p className={styles.sectionSubtitle}>
            Rokhas digitizes and standardizes the entire building permit process in Morocco. From architectural plan submissions to final municipal approvals, our platform provides a single source of truth for all stakeholders.
          </p>
        </div>
        {/* Subtle Watermark Silhouette */}
        <svg className={styles.watermark} viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M10,90 L10,50 L50,20 L90,50 L90,90 Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5" fillOpacity="0.1" />
          <rect x="30" y="60" width="15" height="30" fill="none" stroke="currentColor" strokeWidth="2" />
          <rect x="60" y="50" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      </section>

      {/* 3. Who Uses Rokhas? */}
      <section className={`${styles.section} ${styles.sectionWhite}`}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Who Uses Rokhas?</h2>
          <p className={styles.sectionSubtitle}>A unified ecosystem for every role in the construction lifecycle.</p>
        </div>
        
        <div className={styles.rolesGrid}>
          {/* Citizen */}
          <div className={styles.roleCard}>
            <div className={styles.roleIcon}>
              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
            </div>
            <h3 className={styles.roleTitle}>Citizen</h3>
            <p className={styles.roleDesc}>Submit personal building permit requests, track their progress in real-time, and download approved certificates directly.</p>
          </div>

          {/* Architect */}
          <div className={styles.roleCard}>
            <div className={styles.roleIcon}>
              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"></path></svg>
            </div>
            <h3 className={styles.roleTitle}>Architect</h3>
            <p className={styles.roleDesc}>Attach technical plans, structural blueprints, and validate project documentation against municipal regulations.</p>
          </div>

          {/* Municipality Agent */}
          <div className={styles.roleCard}>
            <div className={styles.roleIcon}>
              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <h3 className={styles.roleTitle}>Municipality Agent</h3>
            <p className={styles.roleDesc}>Review incoming applications, communicate with architects, and formally approve or reject permits via secure digital signatures.</p>
          </div>

          {/* Inspector */}
          <div className={styles.roleCard}>
            <div className={styles.roleIcon}>
              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <h3 className={styles.roleTitle}>Inspector</h3>
            <p className={styles.roleDesc}>Conduct on-site construction visits, take photos, and submit field compliance reports directly from your mobile device.</p>
          </div>

          {/* Admin */}
          <div className={styles.roleCard}>
            <div className={styles.roleIcon}>
              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            </div>
            <h3 className={styles.roleTitle}>Admin</h3>
            <p className={styles.roleDesc}>Manage user access, configure municipal workflows, and monitor platform health through the master dashboard.</p>
          </div>
        </div>
      </section>

      {/* 4. How It Works */}
      <section className={`${styles.section} ${styles.sectionLight}`}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>How It Works</h2>
          <p className={styles.sectionSubtitle}>A seamless, transparent pipeline from drafting table to construction site.</p>
        </div>
        
        <div className={styles.workflowContainer}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <h4 className={styles.stepTitle}>Submit</h4>
            <p className={styles.stepDesc}>Upload architectural plans & documents</p>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <h4 className={styles.stepTitle}>Review</h4>
            <p className={styles.stepDesc}>AI Agent & Municipality compliance checks</p>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <h4 className={styles.stepTitle}>Inspect</h4>
            <p className={styles.stepDesc}>On-site verification</p>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <h4 className={styles.stepTitle}>Approve</h4>
            <p className={styles.stepDesc}>Digital issuance of permit</p>
          </div>
        </div>
      </section>

      {/* 5. Key Features */}
      <section className={`${styles.section} ${styles.sectionDark}`}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Key Features</h2>
          <p className={styles.sectionSubtitle} style={{color: 'rgba(255,255,255,0.7)'}}>Engineered for precision and reliability.</p>
        </div>

        <div className={styles.featuresGrid}>
          <div className={styles.featureItem}>
            <div className={styles.featureIcon}>
              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            </div>
            <div className={styles.featureContent}>
              <h4>Digital Submissions</h4>
              <p>Eliminate paper waste. Upload high-res CADs and PDFs directly.</p>
            </div>
          </div>
          
          <div className={styles.featureItem}>
            <div className={styles.featureIcon}>
              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <div className={styles.featureContent}>
              <h4>Real-time Tracking</h4>
              <p>Instant SMS/Email notifications when your dossier status changes.</p>
            </div>
          </div>
          
          <div className={styles.featureItem}>
            <div className={styles.featureIcon}>
              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            </div>
            <div className={styles.featureContent}>
              <h4>Role-Based Security</h4>
              <p>Bank-grade encryption ensures only authorized personnel see specific plans.</p>
            </div>
          </div>

          <div className={styles.featureItem}>
            <div className={styles.featureIcon}>
              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            <div className={styles.featureContent}>
              <h4>AI-Powered RGC Checks</h4>
              <p>Automated urban planning compliance verification speeds up reviews.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerLogo}>Rokhas.</div>
        <p className={styles.footerTagline}>Digital Administration Platform</p>
        <div className={styles.footerLinks}>
          <Link href="#">About</Link>
          <Link href="#">Contact</Link>
          <Link href="#">Terms of Service</Link>
          <Link href="#">Privacy Policy</Link>
        </div>
        <div className={styles.footerBottom}>
          © {new Date().getFullYear()} Rokhas Platform. All rights reserved. Designed for Moroccan Urbanism.
        </div>
      </footer>
    </div>
  );
}
