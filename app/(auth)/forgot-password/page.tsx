"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/api";
import { useT } from "@/lib/i18n";
import styles from "../auth.module.css";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const t = useT();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError(t("forgot_password_email_required"));
      return;
    }

    setLoading(true);
    setError("");
    try {
      await apiPost("/auth/forgot-password-otp", { email: email.trim() });
      router.push(`/reset-password?email=${encodeURIComponent(email.trim())}`);
    } catch (err) {
      setError((err as Error).message || t("forgot_password_error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.title}>{t("forgot_password_title")}</div>
        <div className={styles.subtitle}>{t("forgot_password_subtitle")}</div>
        <form onSubmit={onSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>{t("reset_password_email_label")}</label>
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
          {error ? <div className={styles.error}>{error}</div> : null}
          <button className="button" type="submit" disabled={loading}>
            {loading ? t("common_loading") : t("forgot_password_button")}
          </button>
        </form>
        <div className={styles.link}>
          <Link className={styles.linkPrimary} href="/login">
            {t("back_to_login")}
          </Link>
        </div>
      </div>
    </div>
  );
}
