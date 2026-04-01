"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { apiPost } from "@/lib/api";
import { useT } from "@/lib/i18n";
import styles from "../auth.module.css";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useT();
  const [email, setEmail] = useState(searchParams?.get("email") || "");
  const [otpCode, setOtpCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const token = String(searchParams?.get("token") || "").trim();
  const tokenMode = !!token;
  const isPasswordValid = password.length >= 8;
  const canSubmit = useMemo(() => {
    if (loading || !isPasswordValid || password !== confirmPassword) return false;
    if (tokenMode) return true;
    return !!email.trim() && otpCode.trim().length === 6;
  }, [loading, isPasswordValid, password, confirmPassword, tokenMode, email, otpCode]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) {
      setError(t("password_rules"));
      return;
    }
    if (password !== confirmPassword) {
      setError(t("password_mismatch"));
      return;
    }
    if (!tokenMode) {
      if (!email.trim()) {
        setError(t("forgot_password_email_required"));
        return;
      }
      if (otpCode.trim().length !== 6) {
        setError(t("reset_password_code_placeholder"));
        return;
      }
    }

    setLoading(true);
    setError("");
    setSuccess("");
    try {
      if (tokenMode) {
        await apiPost("/auth/reset-password", {
          token,
          password,
          confirmPassword,
        });
      } else {
        await apiPost("/auth/reset-password-otp", {
          email: email.trim(),
          otpCode: otpCode.trim(),
          password,
          confirmPassword,
        });
      }
      setSuccess(t("reset_password_success"));
      window.setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch (err) {
      setError((err as Error).message || t("reset_password_error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.title}>{t("reset_password_title")}</div>
        <div className={styles.subtitle}>
          {tokenMode ? t("reset_password_subtitle_token") : t("reset_password_subtitle_code")}
        </div>
        <form onSubmit={onSubmit}>
          {!tokenMode ? (
            <>
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
              <div className={styles.field}>
                <label className={styles.label}>{t("reset_password_code_label")}</label>
                <input
                  className="input"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  inputMode="numeric"
                  placeholder={t("reset_password_code_placeholder")}
                  required
                />
              </div>
            </>
          ) : null}
          <div className={styles.field}>
            <label className={styles.label}>{t("reset_password_new_password_label")}</label>
            <input
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="new-password"
              placeholder={t("reset_password_new_password_label")}
              required
            />
            <div className={`${styles.hint} ${isPasswordValid ? styles.hintOk : styles.hintWarn}`}>{t("password_rules")}</div>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>{t("reset_password_confirm_label")}</label>
            <input
              className="input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              type="password"
              autoComplete="new-password"
              placeholder={t("reset_password_confirm_label")}
              required
            />
          </div>
          {error ? <div className={styles.error}>{error}</div> : null}
          {success ? <div className={styles.info}>{success}</div> : null}
          <button className="button" type="submit" disabled={!canSubmit}>
            {loading ? t("common_loading") : t("reset_password_button")}
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className={styles.container} />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
