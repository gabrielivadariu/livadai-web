"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";
import styles from "./host-wallet.module.css";

type StripeStatus = {
  stripeAccountId?: string | null;
  isStripeChargesEnabled?: boolean;
  isStripePayoutsEnabled?: boolean;
  isStripeDetailsSubmitted?: boolean;
};

type WalletBalance = {
  available?: number;
  pending?: number;
  currency?: string;
};

type Transaction = {
  _id: string;
  amount?: number;
  currency?: string;
  type?: string;
  createdAt?: string;
};

export default function HostWalletPage() {
  const [status, setStatus] = useState<StripeStatus | null>(null);
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadWallet = async () => {
    setLoading(true);
    setError("");
    try {
      const statusRes = await apiGet<StripeStatus>("/stripe/debug/host-status");
      setStatus(statusRes);
      if (statusRes?.stripeAccountId && statusRes?.isStripeChargesEnabled) {
        const balanceRes = await apiGet<WalletBalance>("/stripe/wallet/balance");
        const txRes = await apiGet<Transaction[]>("/stripe/wallet/transactions");
        setBalance(balanceRes);
        setTransactions(txRes || []);
      }
    } catch (err) {
      setError((err as Error).message || "Nu am putut încărca portofelul.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWallet();
  }, []);

  const onConnectStripe = async () => {
    setError("");
    try {
      const data = await apiPost<{ url: string }>("/stripe/create-host-account");
      if (data?.url) window.location.href = data.url;
    } catch (err) {
      setError((err as Error).message || "Nu s-a putut iniția conectarea Stripe.");
    }
  };

  const onCompleteOnboarding = async () => {
    setError("");
    try {
      const data = await apiPost<{ url: string }>("/stripe/create-onboarding-link");
      if (data?.url) window.location.href = data.url;
    } catch (err) {
      setError((err as Error).message || "Nu s-a putut deschide onboarding-ul Stripe.");
    }
  };

  const onOpenDashboard = async () => {
    setError("");
    try {
      const data = await apiGet<{ url: string }>("/stripe/host-dashboard");
      if (data?.url) window.location.href = data.url;
    } catch (err) {
      setError((err as Error).message || "Nu s-a putut deschide dashboard-ul Stripe.");
    }
  };

  const currency = (balance?.currency || "ron").toUpperCase();
  const available = balance?.available ? (balance.available / 100).toFixed(2) : "0.00";
  const pending = balance?.pending ? (balance.pending / 100).toFixed(2) : "0.00";

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <div className={styles.kicker}>Host</div>
          <h1>Portofel / Plăți</h1>
          <p>Gestionează Stripe, balanța și tranzacțiile.</p>
        </div>
      </div>

      {loading ? (
        <div className="muted">Se încarcă portofelul…</div>
      ) : status?.stripeAccountId ? (
        status.isStripeChargesEnabled ? (
          <>
            <div className={styles.balanceGrid}>
              <div className={styles.balanceCard}>
                <div className={styles.balanceLabel}>Disponibil</div>
                <div className={styles.balanceValue}>{available} {currency}</div>
              </div>
              <div className={styles.balanceCard}>
                <div className={styles.balanceLabel}>În așteptare</div>
                <div className={styles.balanceValue}>{pending} {currency}</div>
              </div>
            </div>

            <div className={styles.actions}>
              <button className="button" type="button" onClick={onOpenDashboard}>
                Deschide Stripe Dashboard
              </button>
            </div>

            <div className={styles.section}>
              <h2>Tranzacții recente</h2>
              {transactions.length ? (
                <div className={styles.txList}>
                  {transactions.map((tx) => (
                    <div key={tx._id} className={styles.txRow}>
                      <div>
                        <div className={styles.txType}>{tx.type || "payment"}</div>
                        <div className={styles.txDate}>
                          {tx.createdAt ? new Date(tx.createdAt).toLocaleString("ro-RO") : ""}
                        </div>
                      </div>
                      <div className={styles.txAmount}>
                        {(Number(tx.amount || 0) / 100).toFixed(2)} {(tx.currency || "ron").toUpperCase()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="muted">Nu există tranzacții încă.</div>
              )}
            </div>
          </>
        ) : (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>🔒</div>
            <div className={styles.emptyTitle}>Completează activarea Stripe</div>
            <div className={styles.emptyText}>Finalizează onboarding-ul Stripe pentru a primi plăți.</div>
            <button className="button" type="button" onClick={onCompleteOnboarding}>
              Continuă onboarding
            </button>
          </div>
        )
      ) : (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>💳</div>
          <div className={styles.emptyTitle}>Conectează portofelul Stripe</div>
          <div className={styles.emptyText}>Ai nevoie de Stripe pentru a încasa plăți.</div>
          <button className="button" type="button" onClick={onConnectStripe}>
            Conectează Stripe
          </button>
        </div>
      )}

      {error ? <div className={styles.error}>{error}</div> : null}
    </div>
  );
}
