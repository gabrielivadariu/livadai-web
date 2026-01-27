import styles from "@/app/(app)/legal.module.css";

type LegalPlaceholderProps = {
  title: string;
  subtitle?: string;
};

export default function LegalPlaceholder({ title, subtitle }: LegalPlaceholderProps) {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>{title}</h1>
        <p className={styles.body}>{subtitle || "Last updated: TBD"}</p>
      </div>
      <div className={styles.card}>
        <div className={styles.stack}>
          <p className={styles.section}>Content to be added</p>
          <p className={styles.body}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
            ea commodo consequat.
          </p>
          <p className={styles.body}>
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
            Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est
            laborum.
          </p>
        </div>
      </div>
    </div>
  );
}
