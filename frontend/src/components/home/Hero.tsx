import Link from "next/link";
import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className="container">
        <div className={`${styles.content} animate-fade-in`}>
          <div className={styles.badge}>Portail de l&apos;administration numérique</div>
          <h1 className={styles.title}>
            Simplifiez vos démarches <span>administratives</span> en ligne
          </h1>
          <p className={styles.description}>
            Accédez à tous les services gouvernementaux, soumettez vos requêtes et suivez l&apos;état de vos dossiers en temps réel avec Rokhas.
          </p>
          <div className={styles.actions}>
            <Link href="/services" className={`${styles.btn} ${styles.primaryBtn}`}>
              Nouvelle requête
            </Link>
            <Link href="/track" className={`${styles.btn} ${styles.secondaryBtn}`}>
              Suivre mon dossier
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
