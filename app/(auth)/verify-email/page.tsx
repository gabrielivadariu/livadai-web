"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useMemo, useState } from "react";
import { apiPost } from "@/lib/api";
import { useT } from "@/lib/i18n";
import styles from "../auth.module.css";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const defaultEmail = useMemo(() => searchParams.get("email") || "", [searchParams]);
  const [email, setEmail] = useState(defaultEmail);
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const t = useT();

  const onVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setStatus("");
    try {
      await apiPost("/auth/verify-email-code", { email: email.trim(), code: code.trim() });
      setStatus(t("register_verify_success"));
    } catch (err) {
      const message = (err as Error).message || t("verify_error");
      setError(message);
    }
  };

  const onResend = async () => {
    setError("");
    setStatus("");
    try {
      await apiPost("/auth/resend-email-verification", { email: email.trim() });
      setStatus(t("verify_resend_success"));
    } catch (err) {
      const message = (err as Error).message || t("verify_resend_error");
      setError(message);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.title}>LIVADAI</div>
        <div className={styles.subtitle}>{t("verify_title")}</div>
        <form onSubmit={onVerify}>
          <div className={styles.field}>
            <label className={styles.label}>{t("login_email_label")}</label>
            <input
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
              required
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>{t("register_code_label")}</label>
            <input
              className="input"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="123456"
              required
            />
          </div>
          {status ? <div style={{ color: "#0ba7bd", marginBottom: 8, textAlign: "center" }}>{status}</div> : null}
          {error ? <div className={styles.error}>{error}</div> : null}
          <button className="button" type="submit">
            {t("verify_button")}
          </button>
        </form>
        <div className={styles.link} style={{ marginTop: 10 }}>
          {t("verify_no_code")}{" "}
          <button type="button" onClick={onResend} className={styles.linkPrimary} style={{ background: "none", border: "none" }}>
            {t("verify_resend")}
          </button>
        </div>
        <div className={styles.link}>
          {t("verify_checked")}{" "}
          <Link className={styles.linkPrimary} href="/login">
            {t("login_button")}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  const t = useT();
  return (
    <Suspense fallback={<div className={styles.container}>{t("verify_loading")}</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
