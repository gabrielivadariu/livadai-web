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
  charges_enabled?: boolean;
  payouts_enabled?: boolean;
  details_submitted?: boolean;
};

type WalletBalance = {
  available?: number;
  pending?: number;
  blocked?: number;
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
  const [stripeBalance, setStripeBalance] = useState<WalletBalance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const payoutsEnabled =
    status?.payouts_enabled === undefined ? !!status?.isStripePayoutsEnabled : !!status?.payouts_enabled;
  const chargesEnabled =
    status?.charges_enabled === undefined ? !!status?.isStripeChargesEnabled : !!status?.charges_enabled;

  const loadWallet = async () => {
    setLoading(true);
    setError("");
    try {
      const statusRes = await apiGet<StripeStatus>("/stripe/debug/host-status");
      setStatus(statusRes);
      const statusPayoutsEnabled =
        statusRes?.payouts_enabled === undefined ? !!statusRes?.isStripePayoutsEnabled : !!statusRes?.payouts_enabled;
      const statusChargesEnabled =
        statusRes?.charges_enabled === undefined ? !!statusRes?.isStripeChargesEnabled : !!statusRes?.charges_enabled;
      if (statusRes?.stripeAccountId && statusPayoutsEnabled) {
        const balanceRes = await apiGet<WalletBalance>("/wallet/summary");
        setBalance(balanceRes);
        try {
          const stripeBalanceRes = await apiGet<WalletBalance>("/stripe/wallet/balance");
          setStripeBalance(stripeBalanceRes);
        } catch (stripeErr) {
          setStripeBalance(null);
        }
        if (statusChargesEnabled) {
          const txRes = await apiGet<Transaction[]>("/stripe/wallet/transactions");
          setTransactions(txRes || []);
        } else {
          setTransactions([]);
        }
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
  const stripeCurrency = (stripeBalance?.currency || "ron").toUpperCase();
  const available = balance?.available ? Number(balance.available).toFixed(2) : "0.00";
  const pending = balance?.pending ? Number(balance.pending).toFixed(2) : "0.00";
  const blocked = balance?.blocked ? Number(balance.blocked).toFixed(2) : "0.00";
  const stripeAvailable = stripeBalance?.available ? (Number(stripeBalance.available) / 100).toFixed(2) : "0.00";
  const stripePending = stripeBalance?.pending ? (Number(stripeBalance.pending) / 100).toFixed(2) : "0.00";
  const stripeAvailableValue = Number(stripeBalance?.available || 0);
  const showError = error && !(payoutsEnabled && /Stripe account not ready/i.test(error));

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
        payoutsEnabled ? (
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
              <div className={styles.balanceCard}>
                <div className={styles.balanceLabel}>{t("host_wallet_blocked")}</div>
                <div className={styles.balanceValue}>{blocked} {currency}</div>
              </div>
            </div>
            <div className={styles.infoText}>{t("host_wallet_internal_note")}</div>

            <div className={styles.info}>
              <div className={styles.infoTitle}>{t("host_wallet_stripe_title")}</div>
              <div className={styles.balanceGrid}>
                <div className={styles.balanceCard}>
                  <div className={styles.balanceLabel}>{t("host_wallet_stripe_available")}</div>
                  <div className={styles.balanceValue}>{stripeAvailable} {stripeCurrency}</div>
                </div>
                <div className={styles.balanceCard}>
                  <div className={styles.balanceLabel}>{t("host_wallet_stripe_pending")}</div>
                  <div className={styles.balanceValue}>{stripePending} {stripeCurrency}</div>
                </div>
              </div>
              <div className={styles.infoText}>{t("host_wallet_internal_note")}</div>
              <div className={styles.infoText}>{t("host_wallet_stripe_note")}</div>
              <div className={styles.infoText}>{t("host_wallet_pending_text")}</div>
              <div className={styles.infoText}>{t("host_wallet_dispute_text")}</div>
            </div>

            <div className={styles.actions}>
              <button className="button" type="button" onClick={onOpenDashboard} disabled={stripeAvailableValue <= 0}>
                {t("host_wallet_collect")}
              </button>
              <button className="button secondary" type="button" onClick={loadWallet}>
                {t("host_wallet_refresh")}
              </button>
            </div>
            {stripeAvailableValue <= 0 ? (
              <div className={styles.infoText}>{t("host_wallet_collect_disabled")}</div>
            ) : null}

            <div className={styles.info}>
              <div className={styles.infoTitle}>{t("host_wallet_flow_title")}</div>
              <div className={styles.infoText}>{t("host_wallet_flow_text")}</div>
            </div>

            <div className={styles.section}>
              <h2>{t("host_wallet_transactions")}</h2>
              {chargesEnabled && transactions.length ? (
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
                <div className="muted">
                  {chargesEnabled ? t("host_wallet_no_transactions") : t("walletInfoSoon")}
                </div>
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

      {showError ? <div className={styles.error}>{error}</div> : null}
    </div>
  );
}
