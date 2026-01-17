"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import styles from "../auth.module.css";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      router.push("/experiences");
    } catch (err) {
      const message = (err as Error).message || "Login failed";
      setError(message);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.title}>LIVADAI</div>
        <div className={styles.subtitle}>Explorers & Hosts</div>
        <form onSubmit={onSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
              placeholder="email@exemplu.com"
              required
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Parolă</label>
            <input
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
              placeholder="Parola ta"
              required
            />
          </div>
          {error ? <div className={styles.error}>{error}</div> : null}
          <button className="button" type="submit">
            Login
          </button>
        </form>
        <div className={styles.link}>
          Nu ai cont?{" "}
          <Link className={styles.linkPrimary} href="/register">
            Înregistrează-te
          </Link>
        </div>
      </div>
    </div>
  );
}
