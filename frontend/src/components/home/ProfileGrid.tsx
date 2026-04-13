import Link from "next/link";
import styles from "./ProfileGrid.module.css";

const profiles = [
  {
    id: "citizen",
    title: "Citoyens",
    description: "Effectuez vos demandes de documents, permis ou certificats et payez en ligne en toute sécurité.",
    icon: "👤",
    href: "/citizen",
  },
  {
    id: "business",
    title: "Entreprises",
    description: "Gérez vos autorisations commerciales, déposez vos actes et accédez aux services dédiés aux pros.",
    icon: "🏢",
    href: "/business",
  },
  {
    id: "admin",
    title: "Administration",
    description: "Espace réservé aux agents pour le traitement et la validation des dossiers en cours.",
    icon: "🏛️",
    href: "/admin",
  },
];

export default function ProfileGrid() {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.header}>
          <h2 className={styles.title}>Un accès personnalisé</h2>
          <p className={styles.subtitle}>
            Sélectionnez votre profil pour accéder aux services et démarches qui vous correspondent.
          </p>
        </div>
        
        <div className={styles.grid}>
          {profiles.map((profile) => (
            <div key={profile.id} className={styles.card}>
              <div className={styles.iconWrapper}>{profile.icon}</div>
              <h3 className={styles.cardTitle}>{profile.title}</h3>
              <p className={styles.cardDesc}>{profile.description}</p>
              <Link href={profile.href} className={styles.cardLink}>
                Accéder à l&apos;espace
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
