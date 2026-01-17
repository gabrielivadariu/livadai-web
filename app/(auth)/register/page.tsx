"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
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
  const router = useRouter();
  const { register } = useAuth();
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

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!termsChecked) {
      setError("Trebuie să accepți Termenii și Politica de Confidențialitate.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Parolele nu coincid.");
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
      if (res?.message) {
        setSuccess("Check your email to verify your account");
      }
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err) {
      const message = (err as Error).message || "Register failed";
      setError(message);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.title}>LIVADAI</div>
        <div className={styles.subtitle}>Explorers & Hosts</div>
        <form onSubmit={onSubmit}>
          <div className={styles.label}>Rol</div>
          <div className={styles.roleRow}>
            <button
              type="button"
              className={`${styles.roleButton} ${role === "EXPLORER" ? styles.roleSelected : ""}`}
              onClick={() => setRole("EXPLORER")}
            >
              Explorer
            </button>
            <button
              type="button"
              className={`${styles.roleButton} ${role === "HOST" ? styles.roleSelected : ""}`}
              onClick={() => setRole("HOST")}
            >
              Host
            </button>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Nume</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Parolă</label>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Confirmă parola</label>
            <input
              className="input"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div className={styles.label}>Telefon</div>
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
              Accept{" "}
              <a href="https://sites.google.com/view/terms-conditions-livadai/pagina-de-pornire" target="_blank">
                Termenii
              </a>{" "}
              și{" "}
              <a href="https://sites.google.com/view/privacypolicylivadai/pagina-de-pornire" target="_blank">
                Politica de Confidențialitate
              </a>
            </span>
          </label>

          {success ? (
            <div style={{ color: "#0f766e", marginBottom: 8, textAlign: "center" }}>{success}</div>
          ) : null}
          {error ? <div className={styles.error}>{error}</div> : null}
          <button className="button" type="submit">
            Înregistrează-te
          </button>
        </form>
        <div className={styles.link}>
          Ai deja cont?{" "}
          <Link className={styles.linkPrimary} href="/login">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
