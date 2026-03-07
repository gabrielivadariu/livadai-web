"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiGet } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import adminStyles from "../../admin.module.css";
import styles from "./host-details.module.css";

type AdminHost = {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  stripeAccountId?: string | null;
  livadaiName?: string;
  stripeLegalName?: string;
  stripeDisplayName?: string;
  stripeNameSource?: string;
  nameMatchState?: string;
  bankReference?: string;
  bankReferenceSource?: string;
  phone?: string;
  phoneCountryCode?: string;
  city?: string;
  country?: string;
  accountDeletionStatus?: string;
  accountDeletionRequestedAt?: string | null;
  accountDeletionScheduledAt?: string | null;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  createdAt?: string | null;
  lastAuthAt?: string | null;
  tokenVersion?: number;
  totalParticipants?: number;
  totalEvents?: number;
  ratingAvg?: number;
  ratingCount?: number;
  issues?: string[];
  snapshotAt?: string | null;
  complianceHistory?: AdminHostComplianceHistoryItem[];
};

type AdminHostComplianceHistoryItem = {
  id: string;
  snapshotAt?: string | null;
  triggerType?: string;
  triggerEventType?: string;
  nameMatchState?: string;
  livadaiName?: string;
  stripeLegalName?: string;
  stripeDisplayName?: string;
  stripeNameSource?: string;
  bankName?: string;
  bankLast4?: string;
  bankReferenceSource?: string;
};

type AdminExperience = {
  id: string;
  title?: string;
  status?: string;
  city?: string;
  country?: string;
  startsAt?: string | null;
  participantsBooked?: number;
};

type AdminBooking = {
  id: string;
  status?: string;
  quantity?: number;
  amount?: number;
  currency?: string;
  explorer?: { name?: string; email?: string } | null;
  experience?: { title?: string } | null;
};

type AdminReport = {
  id: string;
  type?: string;
  status?: string;
  reason?: string;
  comment?: string;
  createdAt?: string | null;
  reporter?: { name?: string; email?: string } | null;
};

type AdminHostDetailsResponse = {
  host?: AdminHost;
  complianceSyncWarning?: string;
  counts?: {
    experiencesTotal?: number;
    experiencesActive?: number;
    experiencesCompleted?: number;
    bookingsTotal?: number;
    bookingsPaidLike?: number;
    participantsHosted?: number;
    reportsTotal?: number;
    reportsOpen?: number;
    paymentsDisputed?: number;
    bookingsRefundFailed?: number;
  };
  recentExperiences?: AdminExperience[];
  recentBookings?: AdminBooking[];
  recentReports?: AdminReport[];
};

const ADMIN_ROLE_SET = new Set(["OWNER_ADMIN", "ADMIN", "ADMIN_SUPPORT", "ADMIN_RISK", "ADMIN_FINANCE", "ADMIN_VIEWER"]);
const normalizeRole = (value?: string | null) => String(value || "").trim().toUpperCase();
const isAdminRole = (role?: string | null) => ADMIN_ROLE_SET.has(normalizeRole(role));

const COMPLIANCE_ISSUE_LABELS: Record<string, string> = {
  NO_COMPLIANCE_SNAPSHOT: "Fără snapshot",
  NAME_MISMATCH: "Nume diferit",
  STRIPE_NAME_MISSING: "Nume Stripe lipsă",
  BANK_REFERENCE_MISSING: "Bank ref lipsă",
  STRIPE_DISABLED: "Stripe disabled",
  STRIPE_REQUIREMENTS_DUE: "Requirements due",
  STRIPE_DETAILS_INCOMPLETE: "Details incomplete",
  STRIPE_CHARGES_DISABLED: "Charges disabled",
  STRIPE_PAYOUTS_DISABLED: "Payouts disabled",
  STRIPE_LEGAL_NAME_MISSING: "Nume legal Stripe lipsă",
};

const numberFmt = (value?: number) => new Intl.NumberFormat("ro-RO").format(Number(value || 0));
const formatMoney = (value?: number, currency?: string) => `${numberFmt(value)} ${String(currency || "RON").toUpperCase()}`;
const formatComplianceIssue = (value?: string) => COMPLIANCE_ISSUE_LABELS[String(value || "")] || String(value || "");

const formatDate = (value?: string | null) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("ro-RO", { dateStyle: "medium", timeStyle: "short" }).format(d);
};

const resolveParamId = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) return String(value[0] || "");
  return String(value || "");
};

export default function AdminHostDetailsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { user, token, loading: authLoading } = useAuth();
  const hostId = useMemo(() => resolveParamId(params?.id), [params?.id]);

  const [data, setData] = useState<AdminHostDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      router.replace("/login?reason=auth&next=/admin");
    }
  }, [authLoading, token, router]);

  useEffect(() => {
    if (authLoading) return;
    if (token && user && !isAdminRole(user.role)) {
      router.replace("/");
    }
  }, [authLoading, token, user, router]);

  const loadDetails = useCallback(
    async (forceSync = false) => {
      if (!hostId) return;
      if (forceSync) {
        setSyncing(true);
      } else {
        setLoading(true);
      }
      setError("");
      if (!forceSync) setInfo("");

      try {
        const data = await apiGet<AdminHostDetailsResponse>(`/admin/hosts/${hostId}${forceSync ? "?sync=1" : ""}`);
        setData(data || null);
        if (forceSync) {
          setInfo("Datele Stripe au fost sincronizate.");
        }
      } catch (err) {
        setError((err as Error)?.message || "Nu am putut încărca detaliile host-ului.");
      } finally {
        if (forceSync) {
          setSyncing(false);
        } else {
          setLoading(false);
        }
      }
    },
    [hostId]
  );

  useEffect(() => {
    if (authLoading || !token || !user || !isAdminRole(user.role) || !hostId) return;
    void loadDetails(false);
  }, [authLoading, token, user, hostId, loadDetails]);

  if (authLoading || !token || (user && !isAdminRole(user.role))) {
    return null;
  }

  const host = data?.host || null;

  return (
    <div className={styles.wrapper}>
      <div className={`${adminStyles.card} ${styles.topCard}`}>
        <div>
          <h1 className={styles.title}>Host details</h1>
          <p className={styles.subtitle}>{host ? `${host.name || "—"} · ${host.email || "—"}` : "Identitate & conformitate"}</p>
          {host?.id ? <p className={styles.hostId}>#{host.id.slice(-8)}</p> : null}
        </div>
        <div className={styles.actions}>
          <button type="button" className="button secondary" onClick={() => router.push("/admin")}>
            ← Înapoi la Admin
          </button>
          <button
            type="button"
            className="button"
            disabled={syncing || !host?.stripeAccountId}
            onClick={() => void loadDetails(true)}
            title={host?.stripeAccountId ? "Sincronizează datele Stripe" : "Host-ul nu are cont Stripe conectat"}
          >
            {syncing ? "Sincronizez..." : "Sync Stripe acum"}
          </button>
        </div>
      </div>

      {error ? <div className={`${adminStyles.card} ${adminStyles.errorCard}`}>{error}</div> : null}
      {info ? <div className={`${adminStyles.card} ${styles.infoCard}`}>{info}</div> : null}
      {data?.complianceSyncWarning ? <div className={`${adminStyles.card} ${styles.warnCard}`}>{data.complianceSyncWarning}</div> : null}

      {loading ? <div className={`${adminStyles.card} ${styles.placeholder}`}>Se încarcă detaliile host-ului...</div> : null}
      {!loading && !host ? <div className={`${adminStyles.card} ${adminStyles.errorCard}`}>Host-ul nu a fost găsit.</div> : null}

      {!loading && host ? (
        <div className={styles.grid}>
          <section className={`${adminStyles.card} ${styles.fullWidth}`}>
            <div className={adminStyles.sectionTitleRow}>
              <h2 className={adminStyles.sectionTitle}>Profil host</h2>
              <span className="muted">{host.email || "—"}</span>
            </div>
            <div className={adminStyles.detailGrid}>
              <div><strong>Nume</strong><span>{host.name || "—"}</span></div>
              <div><strong>Email</strong><span>{host.email || "—"}</span></div>
              <div><strong>Telefon</strong><span>{[host.phoneCountryCode, host.phone].filter(Boolean).join(" ") || "—"}</span></div>
              <div><strong>Oraș / Țară</strong><span>{[host.city, host.country].filter(Boolean).join(", ") || "—"}</span></div>
              <div><strong>Role</strong><span>{host.role || "—"}</span></div>
              <div><strong>Email verificat</strong><span>{host.emailVerified ? "Da" : "Nu"}</span></div>
              <div><strong>Telefon verificat</strong><span>{host.phoneVerified ? "Da" : "Nu"}</span></div>
              <div><strong>Creat</strong><span>{formatDate(host.createdAt || null)}</span></div>
              <div><strong>Ultim auth</strong><span>{formatDate(host.lastAuthAt || null)}</span></div>
              <div><strong>Token version</strong><span>{numberFmt(host.tokenVersion)}</span></div>
              <div><strong>Delete status</strong><span>{host.accountDeletionStatus || "NONE"}</span></div>
              <div><strong>Delete scheduled</strong><span>{formatDate(host.accountDeletionScheduledAt || null)}</span></div>
            </div>
          </section>

          <section className={`${adminStyles.card} ${styles.fullWidth}`}>
            <div className={adminStyles.panelTitle}>Stripe + Compliance</div>
            <div className={adminStyles.detailGrid}>
              <div><strong>Stripe account</strong><span>{host.stripeAccountId || "—"}</span></div>
              <div><strong>Snapshot</strong><span>{formatDate(host.snapshotAt || null)}</span></div>
              <div><strong>Nume Stripe</strong><span>{host.stripeLegalName || host.stripeDisplayName || "—"}</span></div>
              <div><strong>Sursă nume Stripe</strong><span>{host.stripeNameSource || "—"}</span></div>
              <div><strong>Nume LIVADAI</strong><span>{host.livadaiName || host.name || "—"}</span></div>
              <div><strong>Name match</strong><span>{host.nameMatchState || "—"}</span></div>
              <div><strong>Bank ref</strong><span>{host.bankReference || "—"}</span></div>
              <div><strong>Sursă bank ref</strong><span>{host.bankReferenceSource || "—"}</span></div>
            </div>
            {(host.issues || []).length > 0 ? (
              <div className={adminStyles.badgeRow}>
                {(host.issues || []).map((issue) => (
                  <span key={`issue-${issue}`} className={`${adminStyles.badge} ${adminStyles.badgeWarn}`}>
                    {formatComplianceIssue(issue)}
                  </span>
                ))}
              </div>
            ) : (
              <div className="muted">Fără alerte de compliance.</div>
            )}
          </section>

          <section className={`${adminStyles.card} ${styles.fullWidth}`}>
            <div className={adminStyles.panelTitle}>Count-uri</div>
            <div className={adminStyles.detailGrid}>
              <div><strong>Experiences total</strong><span>{numberFmt(data?.counts?.experiencesTotal)}</span></div>
              <div><strong>Experiences active</strong><span>{numberFmt(data?.counts?.experiencesActive)}</span></div>
              <div><strong>Experiences completed</strong><span>{numberFmt(data?.counts?.experiencesCompleted)}</span></div>
              <div><strong>Bookings total</strong><span>{numberFmt(data?.counts?.bookingsTotal)}</span></div>
              <div><strong>Bookings paid-like</strong><span>{numberFmt(data?.counts?.bookingsPaidLike)}</span></div>
              <div><strong>Participants hosted</strong><span>{numberFmt(data?.counts?.participantsHosted)}</span></div>
              <div><strong>Reports total</strong><span>{numberFmt(data?.counts?.reportsTotal)}</span></div>
              <div><strong>Reports open</strong><span>{numberFmt(data?.counts?.reportsOpen)}</span></div>
              <div><strong>Disputes</strong><span>{numberFmt(data?.counts?.paymentsDisputed)}</span></div>
              <div><strong>Refund failed</strong><span>{numberFmt(data?.counts?.bookingsRefundFailed)}</span></div>
            </div>
          </section>

          <section className={adminStyles.card}>
            <div className={adminStyles.panelTitle}>Istoric compliance</div>
            {(host.complianceHistory || []).length === 0 ? (
              <div className="muted">Fără snapshot-uri de compliance.</div>
            ) : (
              <div className={adminStyles.stackSm}>
                {(host.complianceHistory || []).slice(0, 10).map((row) => (
                  <div key={row.id} className={adminStyles.miniItem}>
                    <div><strong>{row.nameMatchState || "UNKNOWN"}</strong></div>
                    <div className="muted">LIVADAI: {row.livadaiName || "—"} · Stripe: {row.stripeLegalName || row.stripeDisplayName || "—"}</div>
                    <div className="muted">Bank: {row.bankName ? `${row.bankName} • ****${row.bankLast4 || ""}` : "—"} · {formatDate(row.snapshotAt || null)}</div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className={adminStyles.card}>
            <div className={adminStyles.panelTitle}>Experiențe recente</div>
            {(data?.recentExperiences || []).length === 0 ? (
              <div className="muted">Fără experiențe recente.</div>
            ) : (
              <div className={adminStyles.stackSm}>
                {(data?.recentExperiences || []).slice(0, 12).map((row) => (
                  <div key={row.id} className={adminStyles.miniItem}>
                    <div><strong>{row.title || "Untitled"}</strong></div>
                    <div className="muted">{row.status || "—"} · {[row.city, row.country].filter(Boolean).join(", ") || "—"}</div>
                    <div className="muted">Start: {formatDate(row.startsAt || null)} · Participants: {numberFmt(row.participantsBooked)}</div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className={adminStyles.card}>
            <div className={adminStyles.panelTitle}>Booking-uri recente</div>
            {(data?.recentBookings || []).length === 0 ? (
              <div className="muted">Fără booking-uri recente.</div>
            ) : (
              <div className={adminStyles.stackSm}>
                {(data?.recentBookings || []).slice(0, 12).map((row) => (
                  <div key={row.id} className={adminStyles.miniItem}>
                    <div><strong>{row.experience?.title || "Experience"}</strong></div>
                    <div className="muted">Status: {row.status || "—"} · Explorer: {row.explorer?.name || row.explorer?.email || "—"}</div>
                    <div className="muted">Qty: {numberFmt(row.quantity)} · Amount: {formatMoney(row.amount || 0, row.currency)}</div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className={adminStyles.card}>
            <div className={adminStyles.panelTitle}>Reports recente</div>
            {(data?.recentReports || []).length === 0 ? (
              <div className="muted">Fără reports recente.</div>
            ) : (
              <div className={adminStyles.stackSm}>
                {(data?.recentReports || []).slice(0, 12).map((row) => (
                  <div key={row.id} className={adminStyles.miniItem}>
                    <div><strong>{row.type || "REPORT"}</strong> · {row.status || "—"}</div>
                    <div className="muted">Reporter: {row.reporter?.name || row.reporter?.email || "—"} · {formatDate(row.createdAt || null)}</div>
                    <div className="muted">{row.reason || row.comment || "—"}</div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      ) : null}
    </div>
  );
}
