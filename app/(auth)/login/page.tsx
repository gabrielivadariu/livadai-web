"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useT } from "@/lib/i18n";
import styles from "../auth.module.css";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const t = useT();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const nextPath = searchParams?.get("next");
  const authRequired = searchParams?.get("reason") === "auth";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      router.push(nextPath || "/experiences");
    } catch (err) {
      const message = (err as Error).message || t("login_error");
      setError(message);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.title}>{t("login_title")}</div>
        <div className={styles.subtitle}>{t("login_subtitle")}</div>
        {authRequired ? <div className={styles.info}>{t("login_required")}</div> : null}
        <form onSubmit={onSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>{t("login_email_label")}</label>
            <input
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
              placeholder={t("login_email_placeholder")}
              required
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>{t("login_password_label")}</label>
            <input
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
              placeholder={t("login_password_placeholder")}
              required
            />
          </div>
          {error ? <div className={styles.error}>{error}</div> : null}
          <button className="button" type="submit">
            {t("login_button")}
          </button>
        </form>
        <div className={styles.link}>
          {t("login_no_account")}{" "}
          <Link className={styles.linkPrimary} href="/register">
            {t("login_register")}
          </Link>
        </div>
      </div>
    </div>
  );
}
