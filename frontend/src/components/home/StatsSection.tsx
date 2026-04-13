import styles from "./StatsSection.module.css";

const stats = [
  { id: 1, number: "2.5M+", label: "Requêtes traitées" },
  { id: 2, number: "150+", label: "Services en ligne" },
  { id: 3, number: "80%", label: "Taux de satisfaction" },
  { id: 4, number: "24/7", label: "Disponibilité" },
];

export default function StatsSection() {
  return (
    <section className={styles.section}>
      <div className={`container ${styles.container}`}>
        <div className={styles.header}>
          <h2 className={styles.title}>Quelques chiffres</h2>
          <p className={styles.subtitle}>
            Notre plateforme s&apos;engage à offrir un service performant, transparent et accessible à tous.
          </p>
        </div>

        <div className={styles.grid}>
          {stats.map((stat) => (
            <div key={stat.id} className={styles.statItem}>
              <span className={styles.number}>{stat.number}</span>
              <span className={styles.label}>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
