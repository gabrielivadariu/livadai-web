"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";
import { useLang } from "@/context/lang-context";
import { useT } from "@/lib/i18n";
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
  const { lang } = useLang();
  const t = useT();
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
      setError((err as Error).message || t("host_wallet_load_error"));
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
      setError((err as Error).message || t("host_wallet_connect_error"));
    }
  };

  const onCompleteOnboarding = async () => {
    setError("");
    try {
      const data = await apiPost<{ url: string }>("/stripe/create-onboarding-link");
      if (data?.url) window.location.href = data.url;
    } catch (err) {
      setError((err as Error).message || t("host_wallet_onboarding_error"));
    }
  };

  const onOpenDashboard = async () => {
    setError("");
    try {
      const data = await apiGet<{ url: string }>("/stripe/host-dashboard");
      if (data?.url) window.location.href = data.url;
    } catch (err) {
      setError((err as Error).message || t("host_wallet_dashboard_error"));
    }
  };

  const currency = (balance?.currency || "ron").toUpperCase();
  const available = balance?.available ? (balance.available / 100).toFixed(2) : "0.00";
  const pending = balance?.pending ? (balance.pending / 100).toFixed(2) : "0.00";

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <div className={styles.kicker}>{t("host_kicker")}</div>
          <h1>{t("host_wallet_title")}</h1>
          <p>{t("host_wallet_subtitle")}</p>
        </div>
      </div>

      {loading ? (
        <div className="muted">{t("common_loading_wallet")}</div>
      ) : status?.stripeAccountId ? (
        status.isStripeChargesEnabled ? (
          <>
            <div className={styles.balanceGrid}>
              <div className={styles.balanceCard}>
                <div className={styles.balanceLabel}>{t("host_wallet_available")}</div>
                <div className={styles.balanceValue}>{available} {currency}</div>
              </div>
              <div className={styles.balanceCard}>
                <div className={styles.balanceLabel}>{t("host_wallet_pending")}</div>
                <div className={styles.balanceValue}>{pending} {currency}</div>
              </div>
            </div>

            <div className={styles.actions}>
              <button className="button" type="button" onClick={onOpenDashboard}>
                {t("host_wallet_dashboard")}
              </button>
              <button className="button secondary" type="button" onClick={loadWallet}>
                {t("host_wallet_refresh")}
              </button>
            </div>

            <div className={styles.section}>
              <h2>{t("host_wallet_transactions")}</h2>
              {transactions.length ? (
                <div className={styles.txList}>
                  {transactions.map((tx) => (
                    <div key={tx._id} className={styles.txRow}>
                      <div>
                        <div className={styles.txType}>{tx.type || "payment"}</div>
                        <div className={styles.txDate}>
                          {tx.createdAt ? new Date(tx.createdAt).toLocaleString(lang === "en" ? "en-US" : "ro-RO") : ""}
                        </div>
                      </div>
                      <div className={styles.txAmount}>
                        {(Number(tx.amount || 0) / 100).toFixed(2)} {(tx.currency || "ron").toUpperCase()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="muted">{t("host_wallet_no_transactions")}</div>
              )}
            </div>
          </>
        ) : (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>🔒</div>
            <div className={styles.emptyTitle}>{t("host_wallet_activate_title")}</div>
            <div className={styles.emptyText}>{t("host_wallet_activate_text")}</div>
            <button className="button" type="button" onClick={onCompleteOnboarding}>
              {t("host_wallet_continue")}
            </button>
            <button className="button secondary" type="button" onClick={loadWallet}>
              {t("host_wallet_refresh")}
            </button>
          </div>
        )
      ) : (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>💳</div>
          <div className={styles.emptyTitle}>{t("host_wallet_connect_title")}</div>
          <div className={styles.emptyText}>{t("host_wallet_connect_text")}</div>
          <button className="button" type="button" onClick={onConnectStripe}>
            {t("host_wallet_connect")}
          </button>
        </div>
      )}

      {error ? <div className={styles.error}>{error}</div> : null}
    </div>
  );
}
