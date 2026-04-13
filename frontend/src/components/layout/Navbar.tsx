import Link from "next/link";
import styles from "./Navbar.module.css";

export default function Navbar() {
  return (
    <header className={styles.navbar}>
      <div className={`container ${styles.navContainer}`}>
        <Link href="/" className={styles.logo}>
          <div className={styles.logoIcon}>R</div>
          <span>Rokhas</span>
        </Link>
        <nav className={styles.links}>
          <Link href="/services" className={styles.link}>Services</Link>
          <Link href="/track" className={styles.link}>Suivi</Link>
          <Link href="/directory" className={styles.link}>Annuaire</Link>
          <Link href="/contact" className={styles.link}>Assistance</Link>
        </nav>
        <div className={styles.actions}>
          <Link href="/login" className={styles.loginBtn}>Se connecter</Link>
          <Link href="/register" className={styles.registerBtn}>S&apos;inscrire</Link>
        </div>
      </div>
    </header>
  );
}
