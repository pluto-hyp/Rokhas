import Link from "next/link";
import { AppIcon } from "@/components/AppIcon";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container`}>
        <div className={styles.footerContainer}>
          <div className={`${styles.column} ${styles.brandCol}`}>
            <div className={styles.logo}>
              <div className={styles.logoIcon}>
                <AppIcon className={styles.logoSvg} />
              </div>
              <span>Rokhas</span>
            </div>
            <p className={styles.description}>
              Portail officiel pour les démarches administratives. Simplifiez vos requêtes et suivez vos dossiers en temps réel.
            </p>
          </div>
          
          <div className={styles.column}>
            <h3 className={styles.title}>Services</h3>
            <div className={styles.links}>
              <Link href="#" className={styles.link}>Urbanisme</Link>
              <Link href="#" className={styles.link}>Activités économiques</Link>
              <Link href="#" className={styles.link}>Prestations</Link>
              <Link href="#" className={styles.link}>E-paiement</Link>
            </div>
          </div>

          <div className={styles.column}>
            <h3 className={styles.title}>Aide & Support</h3>
            <div className={styles.links}>
              <Link href="#" className={styles.link}>Centre d&apos;assistance</Link>
              <Link href="#" className={styles.link}>Foire aux questions</Link>
              <Link href="#" className={styles.link}>Tutoriels</Link>
              <Link href="#" className={styles.link}>Contactez-nous</Link>
            </div>
          </div>

          <div className={styles.column}>
            <h3 className={styles.title}>Contact</h3>
            <div className={styles.links}>
              <span className={styles.link}>contact@rokhas.ma</span>
              <span className={styles.link}>+212 522 00 00 00</span>
              <span className={styles.link}>Rabat, Maroc</span>
            </div>
          </div>
        </div>

        <div className={styles.bottomBar}>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} Rokhas. Tous droits réservés.
          </p>
          <div className={styles.legalLinks}>
            <Link href="#" className={styles.link}>Mentions légales</Link>
            <Link href="#" className={styles.link}>Politique de confidentialité</Link>
            <Link href="#" className={styles.link}>CGU</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
