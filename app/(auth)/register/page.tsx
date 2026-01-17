"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { apiPost } from "@/lib/api";
import { useT } from "@/lib/i18n";
import styles from "../auth.module.css";

const countryCodes = [
  { code: "+40", label: "RO" },
  { code: "+1", label: "US/CA" },
  { code: "+44", label: "UK" },
  { code: "+49", label: "DE" },
  { code: "+33", label: "FR" },
  { code: "+34", label: "ES" },
  { code: "+39", label: "IT" },
  { code: "+31", label: "NL" },
  { code: "+46", label: "SE" },
  { code: "+47", label: "NO" },
  { code: "+48", label: "PL" },
  { code: "+36", label: "HU" },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const t = useT();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneCode, setPhoneCode] = useState("+40");
  const [role, setRole] = useState<"EXPLORER" | "HOST">("EXPLORER");
  const [termsChecked, setTermsChecked] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [step, setStep] = useState<"register" | "verify">("register");
  const [code, setCode] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!termsChecked) {
      setError(t("register_terms_error"));
      return;
    }
    if (password !== confirmPassword) {
      setError(t("register_password_mismatch"));
      return;
    }
    try {
      const res = await register({
        name,
        email,
        password,
        confirmPassword,
        role,
        phone,
        phoneCountryCode: phoneCode,
        termsAccepted: true,
        termsAcceptedAt: new Date().toISOString(),
        termsVersion: "v1",
      });
      console.log("REGISTER RESPONSE", res);
      const needsVerification = res?.requiresEmailVerification !== false;
      if (needsVerification) {
        setCode("");
        setStep("verify");
        setSuccess(t("register_verify_subtitle"));
        return;
      }
      setSuccess(t("register_check_email"));
    } catch (err) {
      const message = (err as Error).message || t("register_error");
      setError(message);
    }
  };

  const onVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await apiPost("/auth/verify-email-code", { email: email.trim(), code: code.trim() });
      setSuccess(t("register_verify_success"));
    } catch (err) {
      const message = (err as Error).message || t("register_verify_error");
      setError(message);
    }
  };

  const onResend = async () => {
    setError("");
    setSuccess("");
    try {
      await apiPost("/auth/resend-email-verification", { email: email.trim() });
      setSuccess(t("register_resend_success"));
    } catch (err) {
      const message = (err as Error).message || t("register_resend_error");
      setError(message);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.title}>{t("register_title")}</div>
        <div className={styles.subtitle}>{t("register_subtitle")}</div>
        {step === "register" ? (
          <form onSubmit={onSubmit}>
          <div className={styles.label}>{t("register_role")}</div>
          <div className={styles.roleRow}>
            <button
              type="button"
              className={`${styles.roleButton} ${role === "EXPLORER" ? styles.roleSelected : ""}`}
              onClick={() => setRole("EXPLORER")}
            >
              {t("register_role_explorer")}
            </button>
            <button
              type="button"
              className={`${styles.roleButton} ${role === "HOST" ? styles.roleSelected : ""}`}
              onClick={() => setRole("HOST")}
            >
              {t("register_role_host")}
            </button>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>{t("register_first_name")}</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>{t("register_email")}</label>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>{t("register_password")}</label>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>{t("register_password_confirm")}</label>
            <input
              className="input"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div className={styles.label}>{t("register_phone")}</div>
          <div className={styles.phoneRow}>
            <select className={styles.prefix} value={phoneCode} onChange={(e) => setPhoneCode(e.target.value)}>
              {countryCodes.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label} {c.code}
                </option>
              ))}
            </select>
            <input
              className="input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="712345678"
              required
            />
          </div>

          <label className={styles.termsRow}>
            <input type="checkbox" checked={termsChecked} onChange={(e) => setTermsChecked(e.target.checked)} />
            <span>
              {t("register_terms_prefix")}{" "}
              <a href="https://sites.google.com/view/terms-conditions-livadai/pagina-de-pornire" target="_blank">
                {t("register_terms")}
              </a>{" "}
              {t("register_terms_and")}{" "}
              <a href="https://sites.google.com/view/privacypolicylivadai/pagina-de-pornire" target="_blank">
                {t("register_privacy")}
              </a>
            </span>
          </label>

            {success ? (
              <div style={{ color: "#0f766e", marginBottom: 8, textAlign: "center" }}>{success}</div>
            ) : null}
            {error ? <div className={styles.error}>{error}</div> : null}
            <button className="button" type="submit">
              {t("register_button")}
            </button>
          </form>
        ) : (
          <form onSubmit={onVerify}>
            <div className={styles.label}>{t("register_verify_subtitle")}</div>
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
            {success ? (
              <div style={{ color: "#0f766e", marginBottom: 8, textAlign: "center" }}>{success}</div>
            ) : null}
            {error ? <div className={styles.error}>{error}</div> : null}
            <button className="button" type="submit">
              {t("register_verify_button")}
            </button>
            <div className={styles.link} style={{ marginTop: 10 }}>
              {t("register_no_code")}{" "}
              <button type="button" onClick={onResend} className={styles.linkPrimary} style={{ background: "none", border: "none" }}>
                {t("register_resend")}
              </button>
            </div>
          </form>
        )}
        <div className={styles.link}>
          {t("register_have_account")}{" "}
          <Link className={styles.linkPrimary} href="/login">
            {t("login_button")}
          </Link>
        </div>
      </div>
    </div>
  );
}
