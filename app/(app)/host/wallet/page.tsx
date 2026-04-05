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

const delay = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

const isRetriableWalletError = (err: unknown) => {
  const timeoutCode = (err as Error & { code?: string })?.code;
  const message = String((err as Error)?.message || "").toLowerCase();
  return (
    timeoutCode === "REQUEST_TIMEOUT" ||
    message.includes("fetch failed") ||
    message.includes("failed to fetch") ||
    message.includes("network")
  );
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

  const getWalletErrorMessage = (err: unknown) => {
    const timeoutCode = (err as Error & { code?: string })?.code;
    if (timeoutCode === "REQUEST_TIMEOUT") return t("host_wallet_timeout_error");
    if (isRetriableWalletError(err)) return t("host_wallet_network_error");
    return (err as Error).message || t("host_wallet_load_error");
  };

  const loadWallet = async ({ fromStripeReturn = false } = {}) => {
    setLoading(true);
    setError("");
    const maxAttempts = fromStripeReturn ? 3 : 2;
    let lastError: unknown = null;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      try {
        const statusRes = await apiGet<StripeStatus>("/stripe/debug/host-status", { timeoutMs: 20000 });
        const statusPayoutsEnabled =
          statusRes?.payouts_enabled === undefined ? !!statusRes?.isStripePayoutsEnabled : !!statusRes?.payouts_enabled;
        const statusChargesEnabled =
          statusRes?.charges_enabled === undefined ? !!statusRes?.isStripeChargesEnabled : !!statusRes?.charges_enabled;

        setStatus(statusRes);

        let nextBalance: WalletBalance | null = null;
        let nextStripeBalance: WalletBalance | null = null;
        let nextTransactions: Transaction[] = [];

        if (statusRes?.stripeAccountId && statusPayoutsEnabled) {
          nextBalance = await apiGet<WalletBalance>("/wallet/summary", { timeoutMs: 20000 });
          try {
            nextStripeBalance = await apiGet<WalletBalance>("/stripe/wallet/balance", { timeoutMs: 20000 });
          } catch (_stripeErr) {
            nextStripeBalance = null;
          }
          if (statusChargesEnabled) {
            nextTransactions = (await apiGet<Transaction[]>("/stripe/wallet/transactions", { timeoutMs: 20000 })) || [];
          }
        }

        setBalance(nextBalance);
        setStripeBalance(nextStripeBalance);
        setTransactions(nextTransactions);
        if (fromStripeReturn && typeof window !== "undefined") {
          window.history.replaceState({}, "", "/host/wallet");
        }
        setLoading(false);
        return;
      } catch (err) {
        lastError = err;
        if (attempt < maxAttempts - 1 && isRetriableWalletError(err)) {
          await delay(1200 * (attempt + 1));
          continue;
        } else {
          break;
        }
      }
    }

    setError(getWalletErrorMessage(lastError));
    setLoading(false);
  };

  useEffect(() => {
    const fromStripeReturn =
      typeof window !== "undefined" && new URLSearchParams(window.location.search).get("stripe_return") === "1";
    loadWallet({ fromStripeReturn });
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
  const statusMessage =
    stripeAvailableValue > 0
      ? t("host_wallet_status_available").replace("{{amount}}", stripeAvailable)
      : t("host_wallet_status_empty");
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
            <div className={styles.info}>
              <div className={styles.infoTitle}>{statusMessage}</div>
            </div>

            <div className={styles.info}>
              <div className={styles.infoTitle}>{t("host_wallet_internal_title")}</div>
            </div>
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
              <div className={styles.infoText}>{t("host_wallet_stripe_note")}</div>
            </div>

            <div className={styles.actions}>
              <button className="button" type="button" onClick={onOpenDashboard} disabled={stripeAvailableValue <= 0}>
                {t("host_wallet_collect")}
              </button>
              <button className="button secondary" type="button" onClick={() => loadWallet()}>
                {t("host_wallet_refresh")}
              </button>
            </div>
            {stripeAvailableValue <= 0 ? (
              <div className={styles.infoText}>{t("host_wallet_collect_disabled")}</div>
            ) : null}

            <div className={styles.info}>
              <div className={styles.infoTitle}>{statusMessage}</div>
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
            <button className="button secondary" type="button" onClick={() => loadWallet()}>
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
