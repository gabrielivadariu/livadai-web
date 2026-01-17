"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useMemo, useState } from "react";
import { apiPost } from "@/lib/api";
import styles from "../auth.module.css";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const defaultEmail = useMemo(() => searchParams.get("email") || "", [searchParams]);
  const [email, setEmail] = useState(defaultEmail);
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const onVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setStatus("");
    try {
      await apiPost("/auth/verify-email-code", { email: email.trim(), code: code.trim() });
      setStatus("Cont verificat cu succes");
    } catch (err) {
      const message = (err as Error).message || "Verificarea a eșuat";
      setError(message);
    }
  };

  const onResend = async () => {
    setError("");
    setStatus("");
    try {
      await apiPost("/auth/resend-email-verification", { email: email.trim() });
      setStatus("Ți-am retrimis codul de verificare");
    } catch (err) {
      const message = (err as Error).message || "Retrimiterea a eșuat";
      setError(message);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.title}>LIVADAI</div>
        <div className={styles.subtitle}>Verifică emailul</div>
        <form onSubmit={onVerify}>
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
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
            <label className={styles.label}>Cod de 6 cifre</label>
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
          {status ? <div style={{ color: "#0f766e", marginBottom: 8, textAlign: "center" }}>{status}</div> : null}
          {error ? <div className={styles.error}>{error}</div> : null}
          <button className="button" type="submit">
            Verifică
          </button>
        </form>
        <div className={styles.link} style={{ marginTop: 10 }}>
          Nu ai primit codul?{" "}
          <button type="button" onClick={onResend} className={styles.linkPrimary} style={{ background: "none", border: "none" }}>
            Retrimite cod
          </button>
        </div>
        <div className={styles.link}>
          Ai verificat?{" "}
          <Link className={styles.linkPrimary} href="/login">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className={styles.container}>Se încarcă…</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
